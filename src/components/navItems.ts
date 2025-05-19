import {
  FaUser,
  FaHome,
  FaDiscord,
  FaVideo,
  FaUsers,
  FaChalkboardTeacher,
  FaImages,
  FaBookOpen,
} from "react-icons/fa";
import { FaShop, FaShopSlash } from "react-icons/fa6";

export interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  external?: boolean;
}

export interface NavSection {
  heading: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {

    
    heading: "User",
    items: [
      { label: "Profile", icon: FaUser, href: "/dashboard/profiles" },
      { label: "Users", icon: FaUsers, href: "/dashboard/users" }, // 👈 Added here, right under Profile
    ],
  },
  {
    heading: "Content",
    items: [
      { label: "Explore", icon: FaHome, href: "/dashboard/browse" },
      { label: "Comic Books", icon: FaBookOpen, href: "/comics" },
      { label: "Store", icon: FaShop , href: "/shop"},
    ],
  },

  {
    heading: "Wallet",
    items: [
      {
        label: "Purchase Credits",
        icon: FaShopSlash,
        href: "/credits",
      },
    ],
  },
  

  {
    heading: "Creation Tools",
    items: [
      { label: "Runway", icon: FaVideo, href: "https://runwayml.com/", external: true },
      { label: "Kling AI", icon: FaUsers, href: "https://klingai.com/globalv2", external: true },
      { label: "Hailoui", icon: FaUsers, href: "https://hailuoai.video", external: true },
      { label: "MidLibrary", icon: FaUsers, href: "https://www.midlibrary.com/", external: true },
    ],
  },
  {
    heading: "Learning & Community",
    items: [
      { label: "AI Classes", icon: FaChalkboardTeacher, href: "/dashboard/classes" },
      { label: "KnotReels Discord", icon: FaDiscord, href: "https://discord.com/", external: true },
    ],
  },
];
