-- Up Migration

ALTER TABLE person
    DROP CONSTRAINT chk_calorie_goal_period,
    DROP COLUMN calorie_goal_period;

-- Down Migration

ALTER TABLE person
    ADD COLUMN calorie_goal_period VARCHAR(8),
    ADD CONSTRAINT chk_calorie_goal_period
        CHECK (calorie_goal_period IN ('day', 'week', 'month'));