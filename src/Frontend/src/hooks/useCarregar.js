import { useCallback, useEffect, useRef, useState } from "react";

// Executa uma chamada à API ao montar (e quando `deps` mudam) e expõe
// { dados, carregando, erro, recarregar }. Ignora respostas de chamadas
// antigas para não sobrescrever o resultado mais recente.
export default function useCarregar(carregar, deps = []) {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const ultimaChamada = useRef(0);

  const executar = useCallback(async () => {
    const chamada = ++ultimaChamada.current;

    setCarregando(true);
    setErro("");

    try {
      const resultado = await carregar();

      if (chamada === ultimaChamada.current) {
        setDados(resultado);
      }
    } catch (error) {
      if (chamada === ultimaChamada.current) {
        setErro(error.message);
      }
    } finally {
      if (chamada === ultimaChamada.current) {
        setCarregando(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    executar();
  }, [executar]);

  return { dados, carregando, erro, recarregar: executar };
}
