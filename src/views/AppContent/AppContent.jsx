import React, { useEffect, Fragment, Suspense } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import CustomizedSnackbars from "../../views/Snackbar/CustomSnackbar";

const PrivateRoute = (props) => {
  let virtualId;

  virtualId = localStorage.getItem("virtualId");
  const navigate = useNavigate();
  useEffect(() => {
    if (!virtualId && props.requiresAuth) {
      navigate("/login");
    }
  }, [virtualId]);

  return <>{props.children}</>;
};
const AppContent = ({ routes }) => {
  // const navigate = useNavigate();
  // const location = useLocation();

  return (
    <Fragment>
      <CustomizedSnackbars />
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {routes.map((route) => (
            <Route
              key={route.id}
              path={route.path}
              element={
                <PrivateRoute requiresAuth={route.requiresAuth}>
                  <route.component />
                </PrivateRoute>
              }
            />
          ))}
        </Routes>
      </Suspense>
    </Fragment>
  );
};

export default AppContent;
