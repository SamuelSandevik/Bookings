-- One time codes
CREATE TABLE IF NOT EXISTS otcs (
    user_uuid UUID NOT NULL UNIQUE REFERENCES users(uuid) ON DELETE CASCADE,
    otc TEXT NOT NULL,
    valid_until BIGINT NOT NULL DEFAULT (((extract(epoch FROM NOW()) * 1000)::BIGINT) + (10 * 60 * 1000)),
    created_at BIGINT NOT NULL DEFAULT ((extract(epoch FROM NOW()) * 1000)::BIGINT)
);

-- Removes codes older than 1 day every night at 03:00, to increase security
SELECT cron.schedule(
  'cleanup_otcs_daily',
  '0 3 * * *',
  $$
  DELETE FROM otcs
  WHERE created_at < (extract(epoch FROM now() - interval '1 day') * 1000)::BIGINT;
  $$
);

/* CREATE TRIGGER trg_aiud_otcs_event_log
AFTER INSERT OR UPDATE OR DELETE ON otcs
FOR EACH ROW
EXECUTE FUNCTION log_event_diff_trigger(); */


-- Lost password codes
CREATE TABLE IF NOT EXISTS lpwcs (
    user_uuid UUID NOT NULL UNIQUE REFERENCES users(uuid) ON DELETE CASCADE,
    lpwc TEXT NOT NULL,
    valid_until BIGINT NOT NULL DEFAULT (((extract(epoch FROM NOW()) * 1000)::BIGINT) + (10 * 60 * 1000)),
    created_at BIGINT NOT NULL DEFAULT ((extract(epoch FROM NOW()) * 1000)::BIGINT)
);

-- Removes codes older than 1 day every night at 03:00, to increase security
SELECT cron.schedule(
  'cleanup_lpwcs_daily',
  '0 3 * * *',
  $$
  DELETE FROM lpwcs
  WHERE created_at < (extract(epoch FROM now() - interval '1 day') * 1000)::BIGINT;
  $$
);


/* CREATE TRIGGER trg_aiud_lpwcs_event_log
AFTER INSERT OR UPDATE OR DELETE ON lpwcs
FOR EACH ROW
EXECUTE FUNCTION log_event_diff_trigger(); */