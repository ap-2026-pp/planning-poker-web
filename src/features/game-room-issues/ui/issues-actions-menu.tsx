import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';

import styles from '@widgets/game-room-sidebar/ui/game-room-sidebar.module.css';

type IssuesActionsMenuProps = {
    isCurrentParticipantMaster: boolean;
    hasIssues: boolean;
    onDeleteAllIssues?: () => Promise<void>;
    onExportIssuesAsCsv?: () => Promise<void>;
    onOpenImportPlaneDialog?: () => void;
};

export const IssuesActionsMenu = ({
    isCurrentParticipantMaster,
    hasIssues,
    onDeleteAllIssues,
    onExportIssuesAsCsv,
    onOpenImportPlaneDialog,
}: IssuesActionsMenuProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    if (!isCurrentParticipantMaster) {
        return null;
    }

    const closeMenu = () => {
        setAnchorEl(null);
    };

    const handleDeleteAllIssues = async () => {
        if (!onDeleteAllIssues || !hasIssues || isDeleting) {
            return;
        }

        setIsDeleting(true);

        try {
            await onDeleteAllIssues();
            closeMenu();
        } finally {
            setIsDeleting(false);
        }
    };

    const handleOpenImport = () => {
        closeMenu();
        onOpenImportPlaneDialog?.();
    };

    const handleExportIssuesAsCsv = async () => {
        if (!onExportIssuesAsCsv || !hasIssues || isExporting) {
            return;
        }

        setIsExporting(true);

        try {
            await onExportIssuesAsCsv();
            closeMenu();
        } finally {
            setIsExporting(false);
        }
    };

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
                onClose={closeMenu}
                PaperProps={{ className: styles.issuesMenuPaper }}
            >
                <MenuItem 
                    className={styles.issuesMenuItem} 
                    disabled={!hasIssues || isExporting}
                    onClick={() => void handleExportIssuesAsCsv()}
                >
                    <DownloadRoundedIcon fontSize="small" />
                    <span>{isExporting ? 'Exporting...' : 'Download issues as CSV'}</span>
                </MenuItem>

                <MenuItem className={styles.issuesMenuItem} onClick={handleOpenImport}>
                    <UploadRoundedIcon fontSize="small" />
                    <span>Import from Plane</span>
                </MenuItem>

                <MenuItem
                    className={[styles.issuesMenuItem, styles.issuesMenuItemDanger].join(' ')}
                    disabled={!hasIssues || isDeleting}
                    onClick={() => void handleDeleteAllIssues()}
                >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                    <span>{isDeleting ? 'Deleting...' : 'Delete all issues'}</span>
                </MenuItem>
            </Menu>
        </>
    );
};