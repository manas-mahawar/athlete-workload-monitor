-- =====================================================================
-- athlete_workload_db: schema reference (documentation only)
--
-- DO NOT EXECUTE THIS FILE. It is not a setup or migration script and
-- must not be used to recreate, reset, or modify the database. It records
-- the structure of the existing database so the project can be read and
-- explained: 9 tables, 2 views, and 1 trigger.
--
-- Tables are listed in foreign-key order (parent tables first).
-- The CREATE TABLE statements are exactly what MySQL reports through
-- SHOW CREATE TABLE. The views and trigger come from a mysqldump export.
-- =====================================================================

-- Table: sports
CREATE TABLE `sports` (
  `sport_id` int NOT NULL AUTO_INCREMENT,
  `sport_name` varchar(50) NOT NULL,
  `sport_type` enum('Team','Individual') NOT NULL,
  `acwr_low` decimal(5,2) NOT NULL DEFAULT '0.80',
  `acwr_high` decimal(5,2) NOT NULL DEFAULT '1.30',
  PRIMARY KEY (`sport_id`),
  UNIQUE KEY `sport_name` (`sport_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: coaches
CREATE TABLE `coaches` (
  `coach_id` int NOT NULL AUTO_INCREMENT,
  `coach_name` varchar(100) NOT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `nis_certified` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`coach_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: training_centres
CREATE TABLE `training_centres` (
  `centre_id` int NOT NULL AUTO_INCREMENT,
  `centre_name` varchar(100) NOT NULL,
  `centre_type` enum('NCoE','KISCE','Academy','Other') NOT NULL DEFAULT 'Academy',
  `state` varchar(50) NOT NULL,
  PRIMARY KEY (`centre_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: athletes
CREATE TABLE `athletes` (
  `athlete_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `date_of_birth` date NOT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `home_state` varchar(50) DEFAULT NULL,
  `status` enum('Active','Inactive','Injured') NOT NULL DEFAULT 'Active',
  `sport_id` int NOT NULL,
  `coach_id` int NOT NULL,
  `centre_id` int NOT NULL,
  PRIMARY KEY (`athlete_id`),
  KEY `fk_athlete_sport` (`sport_id`),
  KEY `fk_athlete_coach` (`coach_id`),
  KEY `fk_athlete_centre` (`centre_id`),
  CONSTRAINT `fk_athlete_centre` FOREIGN KEY (`centre_id`) REFERENCES `training_centres` (`centre_id`),
  CONSTRAINT `fk_athlete_coach` FOREIGN KEY (`coach_id`) REFERENCES `coaches` (`coach_id`),
  CONSTRAINT `fk_athlete_sport` FOREIGN KEY (`sport_id`) REFERENCES `sports` (`sport_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: training_sessions
CREATE TABLE `training_sessions` (
  `session_id` int NOT NULL AUTO_INCREMENT,
  `session_date` date NOT NULL,
  `session_type` enum('Practice','Match','Fitness','Recovery') NOT NULL,
  `venue` varchar(100) DEFAULT NULL,
  `coach_id` int NOT NULL,
  PRIMARY KEY (`session_id`),
  KEY `fk_session_coach` (`coach_id`),
  CONSTRAINT `fk_session_coach` FOREIGN KEY (`coach_id`) REFERENCES `coaches` (`coach_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: workload_records
CREATE TABLE `workload_records` (
  `record_id` int NOT NULL AUTO_INCREMENT,
  `athlete_id` int NOT NULL,
  `session_id` int NOT NULL,
  `duration_min` int NOT NULL,
  `rpe` int NOT NULL,
  `session_load` int GENERATED ALWAYS AS ((`duration_min` * `rpe`)) STORED,
  PRIMARY KEY (`record_id`),
  KEY `fk_workload_athlete` (`athlete_id`),
  KEY `fk_workload_session` (`session_id`),
  CONSTRAINT `fk_workload_athlete` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`athlete_id`),
  CONSTRAINT `fk_workload_session` FOREIGN KEY (`session_id`) REFERENCES `training_sessions` (`session_id`),
  CONSTRAINT `chk_duration` CHECK ((`duration_min` > 0)),
  CONSTRAINT `chk_rpe` CHECK ((`rpe` between 0 and 10))
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: injuries
CREATE TABLE `injuries` (
  `injury_id` int NOT NULL AUTO_INCREMENT,
  `athlete_id` int NOT NULL,
  `injury_date` date NOT NULL,
  `body_part` varchar(50) NOT NULL,
  `severity` enum('Mild','Moderate','Severe') NOT NULL,
  `return_date` date DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`injury_id`),
  KEY `fk_injury_athlete` (`athlete_id`),
  CONSTRAINT `fk_injury_athlete` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`athlete_id`),
  CONSTRAINT `chk_injury_dates` CHECK (((`return_date` is null) or (`return_date` >= `injury_date`)))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: recovery_sessions
CREATE TABLE `recovery_sessions` (
  `recovery_id` int NOT NULL AUTO_INCREMENT,
  `injury_id` int NOT NULL,
  `session_date` date NOT NULL,
  `therapy_type` varchar(100) NOT NULL,
  `pain_level` int NOT NULL,
  PRIMARY KEY (`recovery_id`),
  KEY `fk_recovery_injury` (`injury_id`),
  CONSTRAINT `fk_recovery_injury` FOREIGN KEY (`injury_id`) REFERENCES `injuries` (`injury_id`),
  CONSTRAINT `chk_pain_level` CHECK ((`pain_level` between 0 and 10))
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: workload_alerts
CREATE TABLE `workload_alerts` (
  `alert_id` int NOT NULL AUTO_INCREMENT,
  `athlete_id` int NOT NULL,
  `alert_date` date NOT NULL,
  `acwr_value` decimal(5,2) NOT NULL,
  `risk_level` enum('Low','Moderate','High') NOT NULL,
  `is_resolved` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`alert_id`),
  KEY `fk_alert_athlete` (`athlete_id`),
  CONSTRAINT `fk_alert_athlete` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`athlete_id`),
  CONSTRAINT `chk_acwr_nonnegative` CHECK ((`acwr_value` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------------
-- Views
-- Both views are defined by root with SQL SECURITY DEFINER.
-- ---------------------------------------------------------------------

-- One row per athlete with their workload totals. LEFT JOIN keeps
-- athletes who have no workload records (they get 0 sessions, 0 load).
CREATE VIEW `vw_athlete_workload_summary` AS
SELECT a.athlete_id,
       CONCAT(a.first_name, ' ', a.last_name) AS athlete_name,
       s.sport_name,
       COUNT(w.record_id) AS total_sessions,
       COALESCE(SUM(w.session_load), 0) AS total_workload,
       ROUND(AVG(w.session_load), 2) AS average_workload,
       MAX(w.session_load) AS highest_session_load
FROM athletes a
JOIN sports s ON a.sport_id = s.sport_id
LEFT JOIN workload_records w ON a.athlete_id = w.athlete_id
GROUP BY a.athlete_id, a.first_name, a.last_name, s.sport_name;

-- Unresolved alerts at the High risk level only.
CREATE VIEW `vw_high_risk_alerts` AS
SELECT a.athlete_id,
       CONCAT(a.first_name, ' ', a.last_name) AS athlete_name,
       s.sport_name,
       w.alert_date,
       w.acwr_value,
       w.risk_level,
       w.is_resolved
FROM workload_alerts w
JOIN athletes a ON w.athlete_id = a.athlete_id
JOIN sports s ON a.sport_id = s.sport_id
WHERE w.risk_level = 'High' AND w.is_resolved = FALSE;


-- ---------------------------------------------------------------------
-- Trigger
-- Rejects an invalid workload record before it is inserted. The CHECK
-- constraints chk_duration and chk_rpe on workload_records enforce the
-- same rules.
-- ---------------------------------------------------------------------

DELIMITER ;;
CREATE TRIGGER `trg_validate_workload`
BEFORE INSERT ON `workload_records`
FOR EACH ROW
BEGIN
    IF NEW.duration_min <= 0 OR NEW.rpe < 0 OR NEW.rpe > 10 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Invalid duration or RPE value';
    END IF;
END ;;
DELIMITER ;
