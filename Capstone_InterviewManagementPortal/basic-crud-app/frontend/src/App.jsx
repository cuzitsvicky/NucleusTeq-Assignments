import React, { useState, useEffect } from 'react';
import { LogOut, Plus, Trash2, Edit, CheckCircle2, Clock, ExternalLink, User, Layers, RefreshCw, X, AlertCircle } from 'lucide-react';

export default function App({ keycloak }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [editingItem, setEditingItem] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/items', {
        headers: {
          'Authorization': `Bearer ${keycloak.token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch items from database');
      }
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err.message || 'Error occurred while loading data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [keycloak.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = { title, description, status };
    const url = editingItem ? `/api/items/${editingItem._id}` : '/api/items';
    const method = editingItem ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingItem ? 'update' : 'create'} item`);
      }

      // Reset form and reload
      setTitle('');
      setDescription('');
      setStatus('Pending');
      setEditingItem(null);
      setShowFormModal(false);
      fetchItems();
    } catch (err) {
      alert(err.message);
    }
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description);
    setStatus(item.status);
    setShowFormModal(true);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setStatus('Pending');
    setShowFormModal(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${keycloak.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      fetchItems();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    keycloak.logout({ redirectUri: window.location.origin });
  };

  const userEmail = keycloak.tokenParsed?.email || 'user@example.com';
  const userName = keycloak.tokenParsed?.name || keycloak.tokenParsed?.preferred_username || 'SSO User';

  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <Layers className="brand-icon" />
          <span>SSO Dashboard <span className="badge">App B</span></span>
        </div>
        <div className="nav-user">
          <div className="user-profile">
            <User className="user-icon" />
            <div className="user-info">
              <span className="user-name">{userName}</span>
              <span className="user-email">{userEmail}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-logout" title="Log out of SSO session">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Info Header */}
        <section className="sso-showcase">
          <div className="showcase-content">
            <h1>Single Sign-On (SSO) Demo</h1>
            <p>
              This is a basic CRUD application linked to Keycloak. Since you are logged in here, 
              you can open the Capstone application and you will be <strong>automatically logged in</strong> there too.
            </p>
          </div>
          <div className="showcase-actions">
            <a 
              href="http://localhost:5173" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-primary btn-sso-link"
            >
              <span>Open Capstone App (Port 5173)</span>
              <ExternalLink size={16} />
            </a>
          </div>
        </section>

        {/* CRUD section */}
        <section className="crud-section">
          <div className="section-header">
            <div className="header-title">
              <h2>My Items Database</h2>
              <p>Create, update and delete items stored in MongoDB</p>
            </div>
            <button onClick={() => { setEditingItem(null); setShowFormModal(true); }} className="btn btn-success">
              <Plus size={18} />
              <span>Add New Item</span>
            </button>
          </div>

          {error && (
            <div className="error-alert">
              <AlertCircle size={20} />
              <span>{error}</span>
              <button onClick={fetchItems} className="btn-retry">
                <RefreshCw size={16} />
              </button>
            </div>
          )}

          {loading ? (
            <div className="loading-spinner">
              <RefreshCw className="spin" size={32} />
              <p>Fetching database items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <Layers size={48} className="empty-icon" />
              <h3>No items found</h3>
              <p>Your item list is empty. Add a new item to get started!</p>
              <button onClick={() => setShowFormModal(true)} className="btn btn-secondary mt-4">
                <Plus size={16} />
                <span>Create First Item</span>
              </button>
            </div>
          ) : (
            <div className="items-grid">
              {items.map((item) => (
                <div key={item._id} className="item-card">
                  <div className="card-header">
                    <span className={`status-badge ${item.status.toLowerCase().replace(' ', '-')}`}>
                      {item.status === 'Completed' ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <Clock size={12} />
                      )}
                      {item.status}
                    </span>
                  </div>
                  <div className="card-body">
                    <h3>{item.title}</h3>
                    <p>{item.description || 'No description provided.'}</p>
                  </div>
                  <div className="card-footer">
                    <button onClick={() => startEdit(item)} className="btn-icon btn-edit" title="Edit Item">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="btn-icon btn-delete" title="Delete Item">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Form Modal */}
      {showFormModal && (
        <div className="modal-backdrop">
          <div className="modal-content animate-slide-up">
            <div className="modal-header">
              <h3>{editingItem ? 'Edit Database Item' : 'Add New Item'}</h3>
              <button onClick={cancelEdit} className="btn-close">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input 
                  type="text" 
                  id="title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Enter item title" 
                  required 
                  maxLength={50}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea 
                  id="description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Enter item details..." 
                  rows={4}
                  maxLength={200}
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select 
                  id="status" 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={cancelEdit} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  {editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>Centralized Authentication demonstration using Keycloak OIDC & Docker Compose.</p>
      </footer>
    </div>
  );
}
