import { ReactNode } from "react";

interface ILayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: ILayoutProps) => {
  const generalClasses = "ml-auto mr-auto grid grid-cols-4 gap-1";
  const smClasses = "sm:w-[64rem] sm:grid-cols-6";
  const mdClasses = "md:w-[76.8rem] md:grid-cols-8";
  const lgClasses = "lg:w-[102.4rem] lg:grid-cols-10";
  const xlClasses = "xl:w-[128rem] xl:grid-cols-12";
  const xl2Classes = "2xl:w-[153.6rem] 2xl:grid-cols-12";
  const classes = `
  ${smClasses}
  ${mdClasses}
  ${lgClasses}
  ${xlClasses}
  ${xl2Classes}
  ${generalClasses}`;

  return <div className={classes}>{children}</div>;
};

export default Layout;
