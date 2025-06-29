import React from "react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";


// Icons for the application
function Recieve_Icon() {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      width="24px"
      height="24px"
      stroke-linecap="round"
      stroke-linejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#ab9ff2"
        fill-rule="evenodd"
        d="M5.5 6.1a.6.6 0 0 1 .6-.6h.8a.6.6 0 0 1 .6.6v.8a.6.6 0 0 1-.6.6h-.8a.6.6 0 0 1-.6-.6V6.1zM5 17.1a.6.6 0 0 1 .6-.6h.8a.6.6 0 0 1 .6.6v.8a.6.6 0 0 1-.6.6h-.8a.6.6 0 0 1-.6-.6v-.8zM16.5 6.1a.6.6 0 0 1 .6-.6h.8a.6.6 0 0 1 .6.6v.8a.6.6 0 0 1-.6.6h-.8a.6.6 0 0 1-.6-.6V6.1z"
        clip-rule="evenodd"
      />
      <path
        stroke="#ab9ff2"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M3 5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zM3 16a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3zM14 5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2V5z"
      />
      <path
        fill="#ab9ff2"
        d="M13 14a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1zM13 20a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1zM19 20a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1zM19 14a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1zM16 17a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1z"
      />
    </svg>
  );
}

function Send_Icon() {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      width="24px"
      height="24px"
      stroke-linecap="round"
      stroke-linejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        stroke="#ab9ff2"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M10 14l2.976 6.695c.367.828 1.558.78 1.857-.076l5.48-15.659a1 1 0 0 0-1.273-1.274L3.38 9.166c-.854.3-.903 1.49-.075 1.858zm0 0l3.5-3.5"
      />
    </svg>
  );
}

function Swap_Icon() {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      width="24px"
      height="24px"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="MainIcons"
    >
      <path
        stroke="#ab9ff2"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="m9 14-4 4m0 0 4 4m-4-4h11a4 4 0 0 0 4-4m-5-4 4-4m0 0-4-4m4 4H8a4 4 0 0 0-4 4"
      ></path>
    </svg>
  );
}

function Buy_Icon() {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      width="24px"
      height="24px"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="MainIcons"
    >
      <path
        stroke="#ab9ff2"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 1v22m5-18H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6"
      ></path>
    </svg>
  );
}

function SVGComponent() {
  const location = useLocation();
  const [color, setColor] = useState("#323232"); // Default inactive color

  useEffect(() => {
    if (location.pathname === "/") {
      setColor("#ab9ff2"); // Active color
    } else {
      setColor("#999999"); // Inactive color
    }
  }, [location.pathname]);

  return (
    <svg
      width="22px"
      height="22px"
      viewBox="-1.5 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 28.8496C0 30.5896 1.41049 32 3.15041 32H25.2032C26.9432 32 28.3537 30.5896 28.3537 28.8496V13.0282C28.3537 12.1326 27.9725 11.2793 27.3054 10.6817L16.2789 0.803877C15.0825 -0.267959 13.2712 -0.267959 12.0747 0.803877L1.0483 10.6817C0.381205 11.2793 0 12.1326 0 13.0282V28.8496Z"
        fill={color} // Dynamic fill color
      />
      <path
        d="M9.45122 32H18.9024V20.9736C18.9024 20.1036 18.1972 19.3984 17.3272 19.3984H11.0264C10.1565 19.3984 9.45122 20.1036 9.45122 20.9736V32Z"
        fill="#2b2b2b"
      />
    </svg>
  );
}

function Swap_Footer() {
  const location = useLocation();
  const [color, setColor] = useState("#323232"); // Default inactive color

  useEffect(() => {
    if (location.pathname === "/Swap") {
      setColor("#ab9ff2"); // Active color
    } else {
      setColor("#999999"); // Inactive color
    }
  }, [location.pathname]);
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      width="24px"
      height="24px"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="MainIcons"
    >
      <path
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="m9 14-4 4m0 0 4 4m-4-4h11a4 4 0 0 0 4-4m-5-4 4-4m0 0-4-4m4 4H8a4 4 0 0 0-4 4"
      ></path>
    </svg>
  );
}

function SwapCoin_Icon() {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      width="16px"
      height="16px"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="MainIcons"
      style={{ transform: "rotate(90deg)" }}
    >
      <path
        stroke="#222222"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="m9 14-4 4m0 0 4 4m-4-4h11a4 4 0 0 0 4-4m-5-4 4-4m0 0-4-4m4 4H8a4 4 0 0 0-4 4"
      ></path>
    </svg>
  );
}

export function Gas() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
    >
      <g clip-path="url(#clip0_729_12691)">
        <path
          d="M0.75 1.5C0.75 0.672656 1.42266 0 2.25 0H6C6.82734 0 7.5 0.672656 7.5 1.5V6H7.6875C8.82656 6 9.75 6.92344 9.75 8.0625V8.8125C9.75 9.12422 10.0008 9.375 10.3125 9.375C10.6242 9.375 10.875 9.12422 10.875 8.8125V5.20312C10.2281 5.03672 9.75 4.44844 9.75 3.75V2.25L9 1.5C8.79375 1.29375 8.79375 0.95625 9 0.75C9.20625 0.54375 9.54375 0.54375 9.75 0.75L11.5617 2.56172C11.843 2.84297 12 3.225 12 3.62344V8.8125C12 9.74531 11.2453 10.5 10.3125 10.5C9.37969 10.5 8.625 9.74531 8.625 8.8125V8.0625C8.625 7.54453 8.20547 7.125 7.6875 7.125H7.5V10.5C7.91484 10.5 8.25 10.8352 8.25 11.25C8.25 11.6648 7.91484 12 7.5 12H0.75C0.335156 12 0 11.6648 0 11.25C0 10.8352 0.335156 10.5 0.75 10.5V1.5ZM2.25 1.875V4.125C2.25 4.33125 2.41875 4.5 2.625 4.5H5.625C5.83125 4.5 6 4.33125 6 4.125V1.875C6 1.66875 5.83125 1.5 5.625 1.5H2.625C2.41875 1.5 2.25 1.66875 2.25 1.875Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}

export function Backarrow(props) {
  return (
    <div
      onClick={props.SetActiveSidebar}
      style={{ cursor: "pointer", marginTop: "10px", marginBottom: "25px" }}
    >
      <svg
        fill="none"
        viewBox="0 0 24 24"
        width="18px"
        height="18px"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 12H5m0 0 7 7m-7-7 7-7"
        ></path>
      </svg>
    </div>
  );
}

export function Add() {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      width="18px"
      height="18px"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 3v18m-9-9h18"
      ></path>
    </svg>
  );
}

export function Edit() {
  return (
    <svg
      width="18px"
      height="18px"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        stroke="currentColor"
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M13.1976 1.21963L3.11967 11.2976C2.9692 11.448 2.87065 11.6426 2.83836 11.8529L2.13291 16.4474C2.03041 17.115 2.60551 17.6901 3.27309 17.5876L7.86762 16.8822C8.07795 16.8499 8.2725 16.7513 8.42297 16.6009L18.5009 6.52294C18.8914 6.13241 18.8914 5.49925 18.5009 5.10872L14.6118 1.21963C14.2213 0.82911 13.5881 0.829111 13.1976 1.21963ZM4.31657 15.404L4.76548 12.4802L13.9047 3.34095L16.3796 5.81583L7.24036 14.9551L4.31657 15.404Z"
        fill="#000000"
      />
      <path
        stroke="currentColor"
        d="M11.442 5.24658L12.5027 4.18592L15.7436 7.42683L14.6829 8.48749L11.442 5.24658Z"
        fill="#000000"
      />
    </svg>
  );
}

export function Settings() {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      width="18px"
      height="18px"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6"
      ></path>
      <path
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a1.998 1.998 0 0 1 0 2.83 1.998 1.998 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a1.998 1.998 0 0 1-2.83 0 1.998 1.998 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 3.417 1.415 2 2 0 0 1-.587 1.415l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1"
      ></path>
    </svg>
  );
}

export function History() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24px"
      height="24px"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 8V12M14.5 14.5"
        stroke="#8e9397"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></path>
      <path
        d="M5.60414 5.60414L5.07381 5.07381V5.07381L5.60414 5.60414M4.33776 6.87052L3.58777 6.87429C3.58984 7.28556 3.92272 7.61844 4.33399 7.62051L4.33776 6.87052M6.87954 7.6333C7.29757 7.63539 7.63122 7.30129 7.6333 6.88708C7.63538 6.47287 7.30129 6.1354 6.88708 6.13332L6.87954 7.6333M5.07496 4.3212C5.07288 3.90699 4.73541 3.5729 4.3212 3.57498C3.90699 3.57706 3.5729 3.91453 3.57498 4.32874L5.07496 4.3212M3.82661 10.7849C3.88286 10.3745 3.59578 9.99627 3.1854 9.94002C2.77503 9.88377 2.39675 10.1708 2.3405 10.5812L3.82661 10.7849M18.8622 5.13777C15.042 1.31758 8.86873 1.27889 5.07381 5.07381L6.13447 6.13447C9.33358 2.93536 14.5571 2.95395 17.8016 6.19843L18.8622 5.13777ZM5.13777 18.8622C8.95796 22.6824 15.1313 22.7211 18.9262 18.9262L17.8655 17.8655C14.6664 21.0646 9.44291 21.0461 6.19843 17.8016L5.13777 18.8622ZM18.9262 18.9262C22.7211 15.1313 22.6824 8.95796 18.8622 5.13777L17.8016 6.19843C21.0646 9.44291 21.0461 14.6664 17.8655 17.8655L18.9262 18.9262ZM5.07381 5.07381L3.80743 6.34019L4.86809 7.40085L6.13447 6.13447L5.07381 5.07381M4.33399 7.62051L6.87954 7.6333L6.88708 6.13332L4.34153 6.12053L4.33399 7.62051ZM5.08775 6.86675L5.07496 4.3212L3.34749 4.32874L3.58777 6.87429L5.08775 6.86675M2.3405 10.5812L1.93907 13.5099L2.87392 16.5984L5.13777 18.8622L6.19843 17.8016C4.27785 15.881 3.48663 13.2652 3.82661 10.7849L2.3405 10.5812"
        fill="#8e9397"
      ></path>
    </svg>
  );
}

export function Profile() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40px"
      height="40px"
      viewBox="0 0 200 200"
      xml:space="preserve"
    >
      <path
        fill="#282828"
        d="M135.832 140.848h-70.9c-2.9 0-5.6-1.6-7.4-4.5-1.4-2.3-1.4-5.7 0-8.6l4-8.2c2.8-5.6 9.7-9.1 14.9-9.5 1.7-.1 5.1-.8 8.5-1.6 2.5-.6 3.9-1 4.7-1.3-.2-.7-.6-1.5-1.1-2.2-6-4.7-9.6-12.6-9.6-21.1 0-14 9.6-25.3 21.5-25.3s21.5 11.4 21.5 25.3c0 8.5-3.6 16.4-9.6 21.1-.5.7-.9 1.4-1.1 2.1.8.3 2.2.7 4.6 1.3 3 .7 6.6 1.3 8.4 1.5 5.3.5 12.1 3.8 14.9 9.4l3.9 7.9c1.5 3 1.5 6.8 0 9.1-1.6 2.9-4.4 4.6-7.2 4.6zm-35.4-78.2c-9.7 0-17.5 9.6-17.5 21.3 0 7.4 3.1 14.1 8.2 18.1.1.1.3.2.4.4 1.4 1.8 2.2 3.8 2.2 5.9 0 .6-.2 1.2-.7 1.6-.4.3-1.4 1.2-7.2 2.6-2.7.6-6.8 1.4-9.1 1.6-4.1.4-9.6 3.2-11.6 7.3l-3.9 8.2c-.8 1.7-.9 3.7-.2 4.8.8 1.3 2.3 2.6 4 2.6h70.9c1.7 0 3.2-1.3 4-2.6.6-1 .7-3.4-.2-5.2l-3.9-7.9c-2-4-7.5-6.8-11.6-7.2-2-.2-5.8-.8-9-1.6-5.8-1.4-6.8-2.3-7.2-2.5-.4-.4-.7-1-.7-1.6 0-2.1.8-4.1 2.2-5.9.1-.1.2-.3.4-.4 5.1-3.9 8.2-10.7 8.2-18-.2-11.9-8-21.5-17.7-21.5z"
      />
    </svg>
  );
}
export {
  Recieve_Icon,
  Send_Icon,
  Swap_Icon,
  Buy_Icon,
  SVGComponent,
  Swap_Footer,
  SwapCoin_Icon,
};
