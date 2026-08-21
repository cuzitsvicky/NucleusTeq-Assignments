from datetime import datetime

from airflow import DAG
from airflow.operators.bash import BashOperator
from airflow.operators.python import PythonOperator
from airflow.operators.python import BranchPythonOperator
from airflow.utils.trigger_rule import TriggerRule


# Task 1: Check the perimeter
def check_perimeter(**context):
    logger = context["task_instance"].log

    logger.info("Starting perimeter inspection.")
    logger.info("Scanning the area around the survivor base.")

    # Simulated result for this assignment
    perimeter_status = "CLEAR"

    logger.info("Perimeter inspection completed.")
    logger.info("Perimeter status: %s", perimeter_status)

    return perimeter_status


# Task 2: Assess zombie threat
def assess_threat(**context):
    logger = context["task_instance"].log

    logger.info("Assessing current zombie threat level.")

    # Simulated threat level
    threat_level = "LOW"

    logger.info("Threat assessment completed.")
    logger.info("Current threat level: %s", threat_level)

    # Push threat level to XCom
    context["task_instance"].xcom_push(
        key="threat_level",
        value=threat_level,
    )

    logger.info(
        "Threat level '%s' pushed to XCom.",
        threat_level,
    )

    return threat_level


# Task 4: Check barricade
def check_barricade(**context):
    logger = context["task_instance"].log

    logger.info("Checking the condition of the survivor barricade.")

    barricade_status = "SECURE"

    logger.info(
        "Barricade inspection completed: %s",
        barricade_status,
    )

    return barricade_status


# Task 5: Decide whether to fight or hide
def decide_action(**context):
    logger = context["task_instance"].log

    threat_level = context["task_instance"].xcom_pull(
        task_ids="assess_threat",
        key="threat_level",
    )

    logger.info(
        "Retrieved threat level from XCom: %s",
        threat_level,
    )

    if threat_level == "HIGH":
        logger.warning(
            "High zombie threat detected. Survivors must fight."
        )
        return "fight_zombies"

    logger.info(
        "Threat is not high. No combat required."
    )
    logger.info(
        "The fight task will be skipped and survivors will remain hidden."
    )

    return "radio_check"


# Task 6: Fight zombies
def fight_zombies(**context):
    logger = context["task_instance"].log

    logger.warning(
        "Zombie threat is HIGH. Survivors are engaging the threat."
    )

    logger.info("Defensive equipment has been prepared.")
    logger.info("Zombie engagement completed.")


# DAG definition
with DAG(
    dag_id="zombie_survival_dag_task",
    description="Automated zombie apocalypse survival routine",
    start_date=datetime(2026, 8, 1),
    schedule="0 6,18 * * *",
    catchup=False,
    tags=["survival", "assignment", "airflow"],
) as dag:

    check_perimeter_task = PythonOperator(
        task_id="check_perimeter",
        python_callable=check_perimeter,
    )

    assess_threat_task = PythonOperator(
        task_id="assess_threat",
        python_callable=assess_threat,
    )

    prepare_supplies_task = BashOperator(
        task_id="prepare_supplies",
        bash_command=(
            "echo 'Checking food, water and medical supplies.' && "
            "echo 'Supplies are ready for the survival shift.'"
        ),
    )

    check_barricade_task = PythonOperator(
        task_id="check_barricade",
        python_callable=check_barricade,
    )

    decide_action_task = BranchPythonOperator(
        task_id="decide_action",
        python_callable=decide_action,
    )

    fight_zombies_task = PythonOperator(
        task_id="fight_zombies",
        python_callable=fight_zombies,
    )

    radio_check_task = BashOperator(
    task_id="radio_check",
    bash_command=(
        "echo 'Radio check initiated.' && "
        "echo 'Survivor communication channel is operational.'"
    ),
    trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS,
    )

    # Task dependencies
    (
        check_perimeter_task
        >> assess_threat_task
        >> prepare_supplies_task
        >> check_barricade_task
        >> decide_action_task
    )

    decide_action_task >> fight_zombies_task
    decide_action_task >> radio_check_task

    fight_zombies_task >> radio_check_task