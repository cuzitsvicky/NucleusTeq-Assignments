import { useCallback, useEffect, useRef, useState } from 'react';
import { apiService } from '../services/api';

//  Shared constant 

const EMPTY_CANDIDATE_FORM = {
  firstName:       '',
  lastName:        '',
  email:           '',
  mobile:          '',
  currentCompany:  '',
  totalExperience: '',
  appliedJobId:    '',
};

export default function useCandidates(token) {

  //  Candidate list 
  const [candidates, setCandidates] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [page,       setPage]       = useState(1);
  const [hasMore,    setHasMore]    = useState(true);

  // Jobs list shared by Create and Edit modals
  const [jobs, setJobs] = useState([]);

  //  Create modal 
  const [isCreateOpen,   setIsCreateOpen]   = useState(false);
  const [createForm,     setCreateForm]     = useState(EMPTY_CANDIDATE_FORM);
  const [resumeFile,     setResumeFile]     = useState(null);
  const [createError,    setCreateError]    = useState(null);
  const [createLoading,  setCreateLoading]  = useState(false);

  //  Edit modal 
  const [isEditOpen,    setIsEditOpen]    = useState(false);
  const [editForm,      setEditForm]      = useState(EMPTY_CANDIDATE_FORM);
  const [editError,     setEditError]     = useState(null);
  const [editLoading,   setEditLoading]   = useState(false);

  //  Detail modal 
  const [isDetailOpen,        setIsDetailOpen]        = useState(false);
  const [selectedCandidate,   setSelectedCandidate]   = useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusError,         setStatusError]         = useState(null);

  //  History modal 
  const [isHistoryOpen,  setIsHistoryOpen]  = useState(false);
  const [historyList,    setHistoryList]    = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  //  PDF preview modal 
  const [isPreviewOpen,  setIsPreviewOpen]  = useState(false);
  const [previewUrl,     setPreviewUrl]     = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  // We use a ref (not state) to track the current blob URL.
  // This lets us revoke it on unmount without triggering extra re-renders.
  const previewUrlRef = useRef(null);

  // Revoke the blob URL when the component that uses this hook unmounts
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  //  Fetch candidates 

  const fetchCandidates = useCallback(async (pageNumber) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getCandidates(token, pageNumber);
      setCandidates(data);
      // If we got a full page of 10, assume there are more pages
      setHasMore(data.length === 10);
    } catch (err) {
      setError(err.message || 'Failed to load candidates.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCandidates(page);
  }, [fetchCandidates, page]);

  //  Fetch jobs (used by Create and Edit modals) 

  const fetchJobs = useCallback(async (setFirstAsDefault, formSetter) => {
    try {
      const data = await apiService.getJobs(token, 1);
      setJobs(data);
      if (setFirstAsDefault && data.length > 0) {
        formSetter((f) => ({ ...f, appliedJobId: data[0].id }));
      }
    } catch (err) {
      console.error('Error fetching jobs list:', err);
    }
  }, [token]);

  //  Create candidate 

  async function openCreateModal() {
    setCreateForm({ ...EMPTY_CANDIDATE_FORM });
    setResumeFile(null);
    setCreateError(null);
    await fetchJobs(true, setCreateForm);
    setIsCreateOpen(true);
  }

  async function handleCreateCandidate(e) {
    e.preventDefault();
    setCreateError(null);

    if (!resumeFile) {
      setCreateError('Please upload a PDF resume file.');
      return;
    }
    if (resumeFile.type !== 'application/pdf') {
      setCreateError('Resume must be a PDF file.');
      return;
    }

    // Build multipart/form-data because we are uploading a file
    const formData = new FormData();
    formData.append('first_name',       createForm.firstName);
    formData.append('last_name',        createForm.lastName);
    formData.append('email',            createForm.email);
    formData.append('mobile',           createForm.mobile);
    formData.append('current_company',  createForm.currentCompany);
    formData.append('total_experience', createForm.totalExperience);
    formData.append('applied_job_id',   createForm.appliedJobId);
    formData.append('resume',           resumeFile);

    setCreateLoading(true);
    try {
      await apiService.createCandidate(token, formData);
      setIsCreateOpen(false);
      fetchCandidates(page);
    } catch (err) {
      setCreateError(err.message || 'Failed to register candidate.');
    } finally {
      setCreateLoading(false);
    }
  }

  //  Edit candidate 

  async function openEditModal(candidate) {
    setSelectedCandidate(candidate);
    setEditForm({
      firstName:       candidate.first_name       || '',
      lastName:        candidate.last_name        || '',
      email:           candidate.email            || '',
      mobile:          candidate.mobile           || '',
      currentCompany:  candidate.current_company  || '',
      totalExperience: candidate.total_experience || '',
      appliedJobId:    candidate.applied_job_id   || '',
    });
    setEditError(null);
    await fetchJobs(false, setEditForm);
    setIsEditOpen(true);
  }

  async function handleEditCandidate(e) {
    e.preventDefault();
    setEditError(null);
    setEditLoading(true);
    try {
      await apiService.updateCandidate(token, selectedCandidate.id, {
        first_name:       editForm.firstName,
        last_name:        editForm.lastName,
        email:            editForm.email,
        mobile:           editForm.mobile,
        current_company:  editForm.currentCompany,
        total_experience: editForm.totalExperience,
        applied_job_id:   editForm.appliedJobId,
      });
      setIsEditOpen(false);
      fetchCandidates(page);
    } catch (err) {
      setEditError(err.message || 'Failed to update candidate details.');
    } finally {
      setEditLoading(false);
    }
  }

  //  Status update (from detail modal) 

  async function handleUpdateStatus(candidateId, newStatus) {
    setStatusUpdateLoading(true);
    setStatusError(null);
    try {
      await apiService.updateCandidateStatus(token, candidateId, newStatus);
      // Optimistically update the modal so the badge changes immediately
      setSelectedCandidate((prev) => ({ ...prev, status: newStatus }));
      fetchCandidates(page);
    } catch (err) {
      setStatusError(err.message || 'Failed to update candidate status.');
    } finally {
      setStatusUpdateLoading(false);
    }
  }

  //  Status history 

  async function openHistoryModal(candidate) {
    setSelectedCandidate(candidate);
    setHistoryList([]);
    setHistoryLoading(true);
    setIsHistoryOpen(true);
    try {
      const data = await apiService.getCandidateHistory(token, candidate.id);
      setHistoryList(data);
    } catch (err) {
      console.error('History fetch error:', err);
    } finally {
      setHistoryLoading(false);
    }
  }

  //  Resume download 

  async function handleDownloadResume(candidateId, filename) {
    try {
      const url = await apiService.downloadResume(token, candidateId);
      // Programmatically click a hidden anchor to trigger browser download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'resume.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url); // free memory immediately after download starts
    } catch (err) {
      alert('Error downloading resume: ' + err.message);
    }
  }

  //  Resume preview 

  async function openPreviewModal(candidateId) {
    setPreviewLoading(true);
    try {
      // Revoke the old URL before creating a new one to avoid memory leaks
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      const url = await apiService.downloadResume(token, candidateId);
      previewUrlRef.current = url;
      setPreviewUrl(url);
      setIsPreviewOpen(true);
    } catch (err) {
      alert('Error loading resume preview: ' + err.message);
    } finally {
      setPreviewLoading(false);
    }
  }

  function closePreviewModal() {
    setIsPreviewOpen(false);
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
      setPreviewUrl(null);
    }
  }

  //  Return everything the view needs 

  return {
    // List
    candidates, loading, error, page, setPage, hasMore, fetchCandidates,
    // Jobs dropdown
    jobs,
    // Create modal
    isCreateOpen, setIsCreateOpen, createForm, setCreateForm,
    resumeFile, setResumeFile, createError, createLoading,
    openCreateModal, handleCreateCandidate,
    // Edit modal
    isEditOpen, setIsEditOpen, editForm, setEditForm,
    editError, editLoading, openEditModal, handleEditCandidate,
    // Detail modal
    isDetailOpen, setIsDetailOpen, selectedCandidate, setSelectedCandidate,
    statusUpdateLoading, statusError, setStatusError, handleUpdateStatus,
    // History modal
    isHistoryOpen, setIsHistoryOpen, historyList, historyLoading, openHistoryModal,
    // Preview modal
    isPreviewOpen, previewUrl, previewLoading,
    openPreviewModal, closePreviewModal,
    // Resume download
    handleDownloadResume,
  };
}