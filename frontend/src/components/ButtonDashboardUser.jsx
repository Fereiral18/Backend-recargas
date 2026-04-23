import React from "react";

import { useState } from "react";

export const ButtonDashboardUser = (props) => {
  const [barDisplay, setBarDisplay] = useState(false);
  const handleOnClick = () => {
    setBarDisplay(!barDisplay);
  };

  return {
    barDisplay,
    handleOnClick,
  };
};
