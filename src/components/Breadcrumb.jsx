import { Link, useLocation } from "react-router-dom";

const Breadcrumb = () => {
    const location = useLocation();
    const paths = location.pathname.split("/").filter(Boolean);

    const formatName = (str) =>
        str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    return (
        <div className="w-full px-2 py-2">
                <span className="text-md md:text-base font-regular text-light-text-primary dark:text-dark-text-primary">
                    <Link to="/" className="hover:underline">
                        Início
                    </Link>
                    {paths.map((path, index) => (
                        <span key={index}>
                            {" / "}
                            {index === paths.length - 1 ? (
                                <span className="font-regular">
                                    {formatName(path)}
                                </span>
                            ) : (
                                <Link
                                    to={`/${paths.slice(0, index + 1).join("/")}`}
                                    className="hover:underline"
                                >
                                    {formatName(path)}
                                </Link>
                            )}
                        </span>
                    ))}
                </span>
            </div>
    );
};

export default Breadcrumb;
