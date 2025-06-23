import { Outlet } from "react-router-dom";
import { useBeforeUnload } from "../hooks/useBeforeUnload";

function RootLayout() {
  // 2. Call the hook to activate the exit prompt.
  // This will be active on all pages of the app.
  useBeforeUnload({ isBlocked: true });

  return (
    <>
      <Outlet />
    </>
  );
}

export default RootLayout;