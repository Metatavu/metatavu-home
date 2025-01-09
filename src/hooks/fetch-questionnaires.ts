import { useState, useEffect } from "react";
import { useSetAtom } from "jotai";
import { errorAtom } from "src/atoms/error";
import strings from "src/localization/strings";
import { useLambdasApi } from "src/hooks/use-api";
import type { Questionnaire } from "src/generated/homeLambdasClient";

/**
 * Fetch questionnaires hook to fetch questionnaires from the API
 * 
 * @returns loading, setLoading, questionnaires, setQuestionnaires, questionnairesApi
 */
const useFetchQuestionnaires = () => {
  const [loading, setLoading] = useState(false);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const { questionnairesApi } = useLambdasApi();
  const setError = useSetAtom(errorAtom);

  useEffect(() => {
    const fetchQuestionnaires = async () => {
      setLoading(true);
      try {
        const questionnaires = await questionnairesApi.listQuestionnaires();
        setQuestionnaires(questionnaires);
      } catch (error) {
        setError(`${strings.error.questionnaireLoadFailed}, ${error}`);
      }
      setLoading(false);
    };
    fetchQuestionnaires();
  }, []);

  return { loading, setLoading, questionnaires, setQuestionnaires };
};

export default useFetchQuestionnaires;