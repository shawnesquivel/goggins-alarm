// components/shared/Logo.tsx
import React from "react";
import { Svg, Path } from "react-native-svg";

interface LogoProps {
  isDarkMode: boolean;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ isDarkMode, size = 25 }) => (
  <Svg width={size} height={size * 1.04} viewBox="0 0 25 26" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19.5663 10.3319C20.8162 8.68106 21.7509 6.62589 22.2804 4.35825C22.543 3.23347 21.6371 2.22316 20.4821 2.22316L4.5178 2.22316C3.36276 2.22316 2.45691 3.23347 2.71955 4.35825C3.24905 6.6259 4.18366 8.68106 5.43358 10.3319C7.43898 12.9805 10.0056 14.2862 12.5 14.2862C14.9943 14.2862 17.5609 12.9805 19.5663 10.3319ZM0.113802 2.22316C0.103788 2.12583 0.0944266 2.02832 0.0857208 1.93065C-0.0090693 0.867199 0.865516 1.7798e-06 1.93318 1.70106e-06L23.0667 1.42564e-07C24.1344 6.38279e-08 25.009 0.867198 24.9142 1.93065C24.9055 2.02832 24.8961 2.12583 24.8861 2.22316C24.5201 5.78076 23.2826 9.10657 21.3388 11.6739C18.9946 14.77 15.8151 16.5094 12.5 16.5094C9.18476 16.5094 6.00535 14.77 3.66115 11.6739C1.71732 9.10657 0.479813 5.78076 0.113802 2.22316Z"
      fill={isDarkMode ? "#E4E2DD" : "#000000"}
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19.5663 15.6115C20.8162 17.2623 21.7509 19.3175 22.2804 21.5851C22.543 22.7099 21.6371 23.7202 20.4821 23.7202L4.5178 23.7202C3.36276 23.7202 2.45691 22.7099 2.71955 21.5851C3.24905 19.3175 4.18366 17.2623 5.43358 15.6115C7.43898 12.9628 10.0056 11.6572 12.5 11.6572C14.9943 11.6572 17.5609 12.9628 19.5663 15.6115ZM0.113802 23.7202C0.103788 23.8175 0.0944266 23.915 0.0857208 24.0127C-0.0090693 25.0762 0.865516 25.9434 1.93318 25.9434L23.0667 25.9434C24.1344 25.9434 25.009 25.0762 24.9142 24.0127C24.9055 23.915 24.8961 23.8175 24.8861 23.7202C24.5201 20.1626 23.2826 16.8368 21.3388 14.2695C18.9946 11.1734 15.8151 9.43399 12.5 9.43399C9.18476 9.43399 6.00535 11.1734 3.66115 14.2695C1.71732 16.8368 0.479813 20.1626 0.113802 23.7202Z"
      fill={isDarkMode ? "#E4E2DD" : "#000000"}
    />
  </Svg>
);
