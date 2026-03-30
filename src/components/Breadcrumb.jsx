import { Link, useLocation } from "react-router-dom";

const Breadcrumb = () => {
    const location = useLocation();
    const paths = location.pathname.split("/").filter(Boolean);

    const formatName = (str) =>
        str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    return (
        <div className="flex items-center gap-1 text-sm px-1">
            <Link
                to="/"
                className="font-medium text-slate-400 dark:text-slate-500 hover:text-accent-blue dark:hover:text-blue-400 transition-colors"
            >
                Início
            </Link>
            {paths.map((path, index) => (
                <span key={index} className="flex items-center gap-1">
                    <span className="text-slate-300 dark:text-slate-600">/</span>
                    {index === paths.length - 1 ? (
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {formatName(path)}
                        </span>
                    ) : (
                        <Link
                            to={`/${paths.slice(0, index + 1).join("/")}`}
                            className="font-medium text-slate-400 dark:text-slate-500 hover:text-accent-blue dark:hover:text-blue-400 transition-colors"
                        >
                            {formatName(path)}
                        </Link>
                    )}
                </span>
            ))}
        </div>
    );
};

export default Breadcrumb;
