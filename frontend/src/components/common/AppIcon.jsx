// Reusable App Icon Component
// Wraps Font Awesome icons with consistent styling

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ICONS } from "../../icons/icons";
import "./AppIcon.css";

/**
 * AppIcon - A reusable icon component using Font Awesome
 * 
 * @param {string} name - The icon name (key from ICONS mapping)
 * @param {string} className - Additional CSS classes
 * @param {string} size - Font Awesome size: xs, sm, lg, xl, 2xl, or custom like "2x"
 * @param {string} color - CSS color value
 * @param {boolean} spin - Enable spinning animation
 * @param {boolean} pulse - Enable pulse animation
 * @param {object} style - Additional inline styles
 */
function AppIcon({ 
  name, 
  className = "", 
  size, 
  color, 
  spin = false, 
  pulse = false,
  style = {},
  ...rest 
}) {
  const icon = ICONS[name];
  
  if (!icon) {
    console.warn(`AppIcon: Icon "${name}" not found in ICONS mapping`);
    return null;
  }
  
  const iconStyle = {
    ...style,
    ...(color && { color }),
  };

  return (
    <FontAwesomeIcon
      icon={icon}
      className={`app-icon ${className}`}
      size={size}
      spin={spin}
      pulse={pulse}
      style={Object.keys(iconStyle).length > 0 ? iconStyle : undefined}
      {...rest}
    />
  );
}

export default AppIcon;
