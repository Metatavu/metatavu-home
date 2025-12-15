import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { DateTime } from "luxon";
import { useLambdasApi } from "src/hooks/use-api";
import { useSetAtom } from "jotai";
import strings from "src/localization/strings";
import { PdfFile } from "src/generated/homeLambdasClient";
import { errorAtom } from "src/atoms/error";
import { PdfViewer } from "../memos/memo-viewer";
import MemoList from "../memos/memo-list";

/**
 * Memo screen component
 */
const MemoScreen = () => {
  const [selectedYear, setSelectedYear] = useState<DateTime | null>(DateTime.now());
  const [fileList, setFileList] = useState<PdfFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string>();
  const { memoApi } = useLambdasApi();
  const setError = useSetAtom(errorAtom);

  useEffect(() => {
    fetchMemos();
  }, [selectedYear]);

  /**
   * Fetches memo files
   */
  const fetchMemos = async () => {
    if (!selectedYear) {
      throw new Error(strings.memoRequestError.fetchYearError);
    }
    const formattedDate = selectedYear.toJSDate();
    try {
      const validFiles = await memoApi.getMemos({ date: formattedDate });
      setFileList(validFiles);
      setSelectedFileId(validFiles[0]?.id);
    } catch (error) {
      setError(`${strings.memoRequestError.fetchFileError}, ${error}`);
    }
  };

  return (
    <Box 
      display="flex" 
      flexDirection="row" 
      width="100%" 
      height="80vh"
    >
      <MemoList
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        fileList={fileList}
        setSelectedFileId={setSelectedFileId}
      />
      <Box
        display="flex"
        flexDirection="column"
        flexGrow={1}
        alignItems="center"
        justifyContent="center"
      >
        {selectedFileId ? (
          <PdfViewer fileId={selectedFileId} />
        ) : (
          <Typography variant="body1">{strings.memoScreen.selectFile}</Typography>
        )}
      </Box>
    </Box>
  );
};

export default MemoScreen;
