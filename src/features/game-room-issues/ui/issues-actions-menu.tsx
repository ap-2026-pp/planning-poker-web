import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';

import styles from '@widgets/game-room-sidebar/ui/game-room-sidebar.module.css';

type IssuesActionsMenuProps = {
  isCurrentParticipantMaster: boolean;
};

export const IssuesActionsMenu = ({
  isCurrentParticipantMaster,
}: IssuesActionsMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  if (!isCurrentParticipantMaster) {
    return null;
  }

  return (
    <>
      <IconButton
        className={styles.issuesMenuButton}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-label="Меню issues"
      >
        <MoreVertRoundedIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ className: styles.issuesMenuPaper }}
      >
        <MenuItem
          className={styles.issuesMenuItem}
          onClick={() => setAnchorEl(null)}
        >
          <DownloadRoundedIcon fontSize="small" />
          <span>Download issues as CSV</span>
        </MenuItem>

        <MenuItem
          className={styles.issuesMenuItem}
          onClick={() => setAnchorEl(null)}
        >
          <UploadRoundedIcon fontSize="small" />
          <span>Import from Plane</span>
        </MenuItem>

        <MenuItem
          className={[styles.issuesMenuItem, styles.issuesMenuItemDanger].join(' ')}
          onClick={() => setAnchorEl(null)}
        >
          <DeleteOutlineRoundedIcon fontSize="small" />
          <span>Delete all issues</span>
        </MenuItem>
      </Menu>
    </>
  );
};