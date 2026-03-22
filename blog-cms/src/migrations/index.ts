import * as migration_20260320_145456 from './20260320_145456';
import * as migration_20260322_085003 from './20260322_085003';
import * as migration_20260322_120657 from './20260322_120657';

export const migrations = [
  {
    up: migration_20260320_145456.up,
    down: migration_20260320_145456.down,
    name: '20260320_145456',
  },
  {
    up: migration_20260322_085003.up,
    down: migration_20260322_085003.down,
    name: '20260322_085003',
  },
  {
    up: migration_20260322_120657.up,
    down: migration_20260322_120657.down,
    name: '20260322_120657'
  },
];
