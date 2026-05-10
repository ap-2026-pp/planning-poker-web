import { Box } from '@mui/material';
import SportsEsportsRoundedIcon from '@mui/icons-material/SportsEsportsRounded';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import { appRoutes } from '@shared/config/routes';
import styles from '../header.module.css';

type UserGamesMenuProps = {
  variant: 'hero' | 'default';
  isMyGamesPage?: boolean;
};

export const UserGamesMenu = ({ variant, isMyGamesPage }: UserGamesMenuProps) => {
  const { pathname, search } = useLocation();
  const currentPath = `${pathname}${search}`;

  return (
    <Box
      component={RouterLink}
      to={appRoutes.myGames}
      state={{ from: currentPath }}
      className={[
        variant === 'hero' ? styles.homeLink : styles.gamesTriggerDefaultLink,
        isMyGamesPage ? styles.homeLinkActive : '',
      ]
        .join(' ')
        .trim()}
    >
      <SportsEsportsRoundedIcon fontSize="small" />
      <span>Ігри</span>
    </Box>
  );
};