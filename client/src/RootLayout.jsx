import { Outlet } from 'react-router-dom';
import FitScreen from '@fit-screen/react';

function RootLayout() {
  return (
    // Wrap the entire application with FitScreen
    <FitScreen width={1920} height={1080} mode="fit">
      {/* The Outlet component will render the specific page for the current route */}
      <Outlet />
    </FitScreen>
  );
}

export default RootLayout;