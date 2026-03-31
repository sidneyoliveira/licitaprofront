import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useAxios from "../hooks/useAxios";
import { MODALIDADES, fromCode } from "../utils/constantes";

const Breadcrumb = () => {
    const api = useAxios();
    const location = useLocation();
    const paths = location.pathname.split("/").filter(Boolean);
    const [processoLabel, setProcessoLabel] = useState("");

    const formatName = (str) =>
        str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    const processIdInPath = useMemo(() => {
        const idx = paths.indexOf("processos");
        if (idx === -1) return null;

        for (let i = idx + 1; i < paths.length; i += 1) {
            if (/^\d+$/.test(paths[i])) return paths[i];
        }
        return null;
    }, [paths]);

    const modalidadeSigla = (modalidadeRaw) => {
        const opt = fromCode(MODALIDADES, modalidadeRaw);
        const value = String(opt?.value || modalidadeRaw || "").toLowerCase();
        const mapa = {
            pregao_eletronico: "PE",
            pregao_presencial: "PP",
            concorrencia_eletronica: "CE",
            concorrencia_presencial: "CP",
            dispensa_licitacao: "DE",
            inexigibilidade: "IN",
            adesao_registro_precos: "ARP",
            credenciamento: "CR",
            leilao_eletronico: "LE",
            leilao_presencial: "LP",
            dialogo_competitivo: "DC",
        };
        return mapa[value] || "";
    };

    useEffect(() => {
        let cancelled = false;

        const loadProcessoLabel = async () => {
            if (!processIdInPath) {
                setProcessoLabel("");
                return;
            }

            try {
                const { data } = await api.get(`/processos/${processIdInPath}/`);
                if (cancelled) return;

                const numeroCertame = String(data?.numero_certame || "").trim();
                if (!numeroCertame) {
                    setProcessoLabel(processIdInPath);
                    return;
                }

                const base = numeroCertame.replace(/[\\/]+/g, "_");
                const sigla = modalidadeSigla(data?.modalidade);
                setProcessoLabel(sigla ? `${base}-${sigla}` : base);
            } catch {
                if (!cancelled) setProcessoLabel(processIdInPath);
            }
        };

        loadProcessoLabel();
        return () => {
            cancelled = true;
        };
    }, [api, processIdInPath]);

    return (
        <div className="flex items-center gap-1 text-sm px-1">
            <Link
                to="/"
                className="font-medium text-slate-400 dark:text-slate-500 hover:text-accent-blue dark:hover:text-blue-400 transition-colors"
            >
                Início
            </Link>
            {paths.map((path, index) => {
                const isProcessoId = processIdInPath && path === processIdInPath;
                const label = isProcessoId && processoLabel ? processoLabel : formatName(path);

                return (
                <span key={index} className="flex items-center gap-1">
                    <span className="text-slate-300 dark:text-slate-600">/</span>
                    {index === paths.length - 1 ? (
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {label}
                        </span>
                    ) : (
                        <Link
                            to={`/${paths.slice(0, index + 1).join("/")}`}
                            className="font-medium text-slate-400 dark:text-slate-500 hover:text-accent-blue dark:hover:text-blue-400 transition-colors"
                        >
                            {label}
                        </Link>
                    )}
                </span>
            )})}
        </div>
    );
};

export default Breadcrumb;
