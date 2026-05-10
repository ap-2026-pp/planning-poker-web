import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded';
import ViewKanbanRoundedIcon from '@mui/icons-material/ViewKanbanRounded';
import { Box } from '@mui/material';

import type { SidebarView } from './game-room-sidebar';
import styles from './game-room-sidebar.module.css';

type GameRoomSidebarTabsProps = {
  sidebarView: SidebarView;
  onSidebarViewChange: (value: SidebarView) => void;
};

export const GameRoomSidebarTabs = ({
  sidebarView,
  onSidebarViewChange,
}: GameRoomSidebarTabsProps) => {
  return (
    <Box className={styles.sidebarTabs}>
      <button
        type="button"
        onClick={() => onSidebarViewChange('players')}
        className={[
          styles.sidebarTab,
          sidebarView === 'players' ? styles.sidebarTabActive : '',
        ].join(' ').trim()}
      >
        <Groups2RoundedIcon className={styles.sidebarTabIcon} />
        <span>Гравці</span>
      </button>

      <button
        type="button"
        onClick={() => onSidebarViewChange('issues')}
        className={[
          styles.sidebarTab,
          sidebarView === 'issues' ? styles.sidebarTabActive : '',
        ].join(' ').trim()}
      >
        <ViewKanbanRoundedIcon className={styles.sidebarTabIcon} />
        <span>Issues</span>
      </button>
    </Box>
  );
};