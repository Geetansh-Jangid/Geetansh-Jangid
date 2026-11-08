export const SITE_TITLE = "logbook";
export const SITE_DESCRIPTION =
  "notes, research, and technical observations by geetansh jangid.";
export const SITE_URL = "https://geetansh.tech";
export const AUTHOR_NAME = "Geetansh Jangid";
export const AUTHOR_JOB_TITLE = "developer, researcher";
export const AUTHOR_EMAIL = "work@geetansh.tech";

export interface MenuItem {
  label: string;
  url: string;
  external?: boolean;
}

export const menuItems: MenuItem[] = [
  {
    label: "geetansh",
    url: "/",
  },
  {
    label: "logbook",
    url: "/logbook/",
  },
  {
    label: "observations",
    url: "/observations/",
  },
];

export const socialLinks = [
  {
    label: "github",
    url: "https://github.com/Geetansh-Jangid",
    external: true,
  },
  {
    label: "email",
    url: "mailto:work@geetansh.tech",
  },
  {
    label: "rss",
    url: "/rss.xml",
  },
  {
    label: "source",
    url: "https://github.com/Geetansh-Jangid/Geetansh-Jangid",
    external: true,
  },
];
