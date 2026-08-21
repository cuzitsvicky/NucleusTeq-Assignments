# Zombie Survival DAG

## Overview

The Zombie Survival DAG is an automated Apache Airflow workflow designed to run a repeatable survival routine for a small group of survivors. The DAG contains seven tasks that inspect the surroundings, assess the zombie threat, prepare supplies, check the barricade, decide the appropriate action, and perform a final radio check.

## Task Flow

The workflow starts with `check_perimeter`, which checks whether the surrounding area is safe. The `assess_threat` task then determines the current zombie threat level and passes this information to the next decision-making task using XCom. `prepare_supplies` checks the available survival supplies, while `check_barricade` verifies that the base is secure.

The `decide_action` task uses the threat level to determine whether the survivors need to fight or remain safe. If the threat level is high, `fight_zombies` is executed. Otherwise, the fight task is deliberately skipped. The workflow then completes with `radio_check` to confirm that communication with other survivors is operational.

## XCom Data

The `assess_threat` task pushes the `threat_level` value to XCom. The `decide_action` task retrieves this value from XCom and uses it to determine the next action. XCom is useful here because the threat assessment result needs to be shared between tasks without directly coupling their implementations.

## Skip Condition

The `fight_zombies` task is skipped when the threat level is not `HIGH`. In the current scenario, the threat level is `LOW`, so there is no need for combat. The `radio_check` task still runs because it uses an appropriate trigger rule that allows execution when the fight task is skipped.

## Schedule

The DAG uses the cron schedule `0 6,18 * * *`, meaning the survival routine runs twice a day at 6:00 AM and 6:00 PM. This represents realistic dawn and dusk survival checks, when the survivors would inspect the perimeter, supplies, barricade, and current threat situation.

## Technologies

- Apache Airflow
- PythonOperator
- BashOperator
- BranchPythonOperator
- XCom
- Airflow task logging
- Cron scheduling