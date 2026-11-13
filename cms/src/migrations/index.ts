import * as migration_20260626_071809_initial_schema from './20260626_071809_initial_schema';
import * as migration_20261028_174845_payload_3_92_upgrade from './20261028_174845_payload_3_92_upgrade';
import * as migration_20261113_013042_site_description_upv_default from './20261113_013042_site_description_upv_default';

export const migrations = [
  {
    up: migration_20260626_071809_initial_schema.up,
    down: migration_20260626_071809_initial_schema.down,
    name: '20260626_071809_initial_schema',
  },
  {
    up: migration_20261028_174845_payload_3_92_upgrade.up,
    down: migration_20261028_174845_payload_3_92_upgrade.down,
    name: '20261028_174845_payload_3_92_upgrade',
  },
  {
    up: migration_20261113_013042_site_description_upv_default.up,
    down: migration_20261113_013042_site_description_upv_default.down,
    name: '20261113_013042_site_description_upv_default'
  },
];
