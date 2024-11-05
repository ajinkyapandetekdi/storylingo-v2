import { Box, Typography } from "@mui/material";
import HomophonesFinder from "homophones";
import React, { createRef, useContext, useEffect, useState } from "react";
import {
  AudioBarColoredSvg,
  AudioBarSvg,
  AudioPlayerSvg,
  PlayAudioButton,
  StopAudioButton,
  getLocalData,
  randomizeArray,
} from "../../utils/constants";
import MainLayout from "../Layouts.jsx/MainLayout";
import correctSound from "../../assets/audio/correct.wav";
import wrongSound from "../../assets/audio/wrong.wav";
import VoiceAnalyser from "../../utils/VoiceAnalyser";
import { MyContext } from "../../views/Practice/Practice";

const Mechanics2 = ({
  page,
  setPage,
  type,
  background,
  header,
  parentWords,
  image,
  setRecordedAudio,
  setVoiceAnimate,
  storyLine,
  showTimer,
  points,
  steps,
  currentStep,
  contentId,
  contentType,
  level,
  isDiscover,
  progressData,
  showProgress,
  callUpdateLearner,
  disableScreen,
  isShowCase,
  handleBack,
  allWords,
  loading,
  setOpenMessageDialog,
}) => {
  const { setEnableNext } = useContext(MyContext) || {};
  const [words, setWords] = useState([]);
  const [sentences, setSentences] = useState([]);

  const [selectedWord, setSelectedWord] = useState("");
  // const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [wordToFill, setWordToFill] = useState("");
  const [disabledWords, setDisabledWords] = useState(false);
  const lang = getLocalData("lang");
  let wordToCheck = type === "audio" ? parentWords : wordToFill;

  useEffect(() => {
    const initializeFillInTheBlank = async () => {
      if (type === "fillInTheBlank" && parentWords?.length) {
        let wordsArr = parentWords.split(" ");
        let randomIndex = Math.floor(Math.random() * wordsArr.length);
        try {
          await getSimilarWords(wordsArr[randomIndex]);
          setWordToFill(wordsArr[randomIndex]);
          wordsArr[randomIndex] = "dash";
          setSentences(wordsArr);
          setSelectedWord("");
        } catch (error) {
          console.error("Error in initializeFillInTheBlank:", error);
        }
      }
    };
    initializeFillInTheBlank();
  }, [contentId, parentWords]);

  useEffect(() => {
    const initializeAudio = async () => {
      if (type === "audio" && parentWords) {
        setDisabledWords(true);
        setSelectedWord("");
        try {
          await getSimilarWords(parentWords);
        } catch (error) {
          console.error("Error in initializeAudio:", error);
        }
      }
    };
    initializeAudio();
  }, [contentId, parentWords]);

  //console.log('Mechanics6');

  const getSimilarWords = async (wordForFindingHomophones) => {
    const lang = getLocalData("lang");
    // const isFillInTheBlanks = type === "fillInTheBlank";
    const wordToSimilar = wordForFindingHomophones
      ? wordForFindingHomophones
      : parentWords;

    if (lang === "en") {
      const finder = new HomophonesFinder();
      const homophones = await finder.find(wordToSimilar);
      let wordsArr = [homophones[8], wordToSimilar, homophones[6]];
      setWords(randomizeArray(wordsArr));
    } else {
      let wordsToShow = [];
      if (type == "audio") {
        wordsToShow = allWords?.filter((elem) => elem != wordToSimilar);
      }
      if (type == "fillInTheBlank") {
        wordsToShow = allWords
          ?.join(" ")
          ?.split(" ")
          .filter((elem) => elem !== wordToSimilar && elem.length > 2);
      }

      wordsToShow = randomizeArray(wordsToShow).slice(0, 2);
      wordsToShow.push(wordToSimilar);
      setWords(randomizeArray(wordsToShow));
    }
  };

  const handleWord = (word, removeWord) => {
    if (removeWord) {
      setWords([...words, word]);
      setSelectedWord("");
      setEnableNext(false);
    } else {
      let wordsArr = [...words];

      if (type !== "audio") {
        let index = wordsArr?.findIndex((elem) => elem === word);
        if (index !== -1) {
          wordsArr?.splice(index, 1);
        }
      }

      if (selectedWord && type !== "audio") {
        wordsArr.push(selectedWord);
      }

      // if (type === "audio") {
      const isSoundCorrect = word === wordToCheck;
      let audio = new Audio(isSoundCorrect ? correctSound : wrongSound);
      if (!isSoundCorrect) {
        setEnableNext(false);
      }
      audio.play();
      setShake(true);
      setTimeout(() => {
        setShake(false);
      }, 800);
      // }

      setWords(wordsArr);
      setSelectedWord(word);
    }
  };

  const audioRef = createRef(null);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = React.useState(false);

  const [isPlaying, setIsPlaying] = React.useState(false);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.pause();
      audioRef.current.load();
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const [currrentProgress, setCurrrentProgress] = React.useState(0);
  const progressBarWidth = isNaN(currrentProgress / duration)
    ? 0
    : currrentProgress / duration;

  return (
    <MainLayout
      pageName={"m6"}
      background={background}
      showTimer={showTimer}
      points={points}
      {...{
        steps,
        currentStep,
        level,
        progressData,
        showProgress,
        handleBack,
        disableScreen,
        loading,
      }}
    >
      <div
        style={{
          left: `calc(50% - 258px / 2)`,
          top: `calc(50% - 45px / 2 - 235.5px)`,
          fontFamily: "Quicksand",
          fontStyle: "normal",
          fontWeight: 600,
          fontSize: "36px",
          lineHeight: "45px",
          alignItems: "center",
          textAlign: "center",
          color: "#333F61",
        }}
      >
        {header}
      </div>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "60px",
          letterSpacing: "5px",
          height: "100%",
          flexWrap: "wrap",
        }}
      >
        {type === "audio" ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            {/* <ReactAudioPlayer src={v11} controls /> */}

            {contentId && (
              <audio
                ref={audioRef}
                preload="metadata"
                onDurationChange={(e) => setDuration(e.currentTarget.duration)}
                onCanPlay={(e) => {
                  setIsReady(true);
                }}
                onPlaying={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={(e) => {
                  setCurrrentProgress(e.currentTarget.currentTime);
                }}
              >
                <source
                  type="audio/mp3"
                  src={
                    contentId
                      ? `${process.env.REACT_APP_AWS_S3_BUCKET_CONTENT_URL}/all-audio-files/${lang}/${contentId}.wav`
                      : ""
                  }
                />
              </audio>
            )}

            <Box position="relative" sx={{ width: "403px" }}>
              <AudioPlayerSvg />
              <Box
                position="absolute"
                sx={{ cursor: "pointer", top: "13px", left: "96px" }}
              >
                <AudioBarSvg />
              </Box>
              <Box
                position="absolute"
                sx={{ cursor: "pointer", top: "13px", left: "96px" }}
              >
                <AudioBarColoredSvg width={progressBarWidth * 275} />
              </Box>
              <Box
                position="absolute"
                sx={{ cursor: "pointer", top: "15px", left: "25px" }}
                onClick={() => {
                  togglePlayPause();
                  setDisabledWords(false);
                }}
              >
                {isReady && (
                  <>{isPlaying ? <StopAudioButton /> : <PlayAudioButton />}</>
                )}
              </Box>
            </Box>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                position: "absolute",
                left: 0,
                marginTop: "40px",
                marginLeft: "80px",
                // Add responsiveness
                width: "100%", // Full width on smaller screens
                maxWidth: "500px", // Limit width on larger screens
                "@media (max-width: 600px)": {
                  position: "relative",
                  marginTop: "20px", // Adjust margin on small screens
                  marginLeft: "20px", // Adjust margin on small screens
                  width: "70%", // Adjust width for smaller devices
                },
                "@media (min-width: 600px)": {
                  marginTop: "30px",
                  marginLeft: "50px",
                },
              }}
            >
              <img
                src={image}
                placeholder="image"
                style={{ width: "100%", height: "auto", maxWidth: "200px" }}
              />
            </Box>
            {sentences?.map((elem, index) => (
              <React.Fragment key={index}>
                {elem === "dash" ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      marginLeft: index > 0 && "10px",
                      minWidth: "120px",
                      height: "80px",
                      borderBottom: "3px solid #5F6C92",
                      position: "relative",
                    }}
                  >
                    {selectedWord && (
                      <Box
                        onClick={() => handleWord(selectedWord, true)}
                        className={
                          elem === "dash"
                            ? selectedWord === wordToCheck
                              ? `audioSelectedWord`
                              : `audioSelectedWrongWord ${
                                  shake ? "shakeImage" : ""
                                }`
                            : ""
                        }
                        sx={{
                          textAlign: "center",
                          px: "25px",
                          py: "12px",
                          // background: "transparent",
                          m: 1,
                          textTransform: "none",
                          borderRadius: "12px",
                          border: `1px solid ${
                            elem === "dash"
                              ? selectedWord === wordToCheck
                                ? "#58CC02"
                                : "#C30303"
                              : "#333F61"
                          }`,
                          background: "#FFF",
                          cursor: "pointer",
                        }}
                      >
                        <span
                          style={{
                            color:
                              elem === "dash"
                                ? selectedWord === wordToCheck
                                  ? "#58CC02"
                                  : "#C30303"
                                : "#333F61",
                            fontWeight: 600,
                            fontSize: "32px",
                            fontFamily: "Quicksand",
                          }}
                        >
                          {selectedWord}
                        </span>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      marginLeft: index > 0 && "10px",
                    }}
                  >
                    <Typography
                      variant="h5"
                      component="h4"
                      sx={{
                        mb: 4,
                        mt: 4,
                        fontSize: "40px",
                        color: "#303050",
                        textAlign: "center",
                        fontFamily: "Quicksand",
                      }}
                    >
                      {elem}
                    </Typography>
                  </Box>
                )}
              </React.Fragment>
            ))}
          </>
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          marginTop: "20px",
          marginBottom: "30px",
        }}
      >
        {words?.map((elem) => (
          <Box
            key={elem}
            className={`${
              type === "audio" && selectedWord === elem
                ? selectedWord === parentWords
                  ? `audioSelectedWord`
                  : `audioSelectedWrongWord ${shake ? "shakeImage" : ""}`
                : ""
            }`}
            onClick={() => handleWord(elem)}
            sx={{
              textAlign: "center",
              px: "25px",
              py: "12px",
              // background: "transparent",
              m: 1,
              textTransform: "none",
              borderRadius: "12px",
              border: `1px solid rgba(51, 63, 97, 0.10)`,
              background: "#FFF",
              cursor: "pointer",
              opacity: disabledWords ? 0.25 : 1,
              pointerEvents: disabledWords ? "none" : "initial",
            }}
          >
            <span
              style={{
                color:
                  type === "audio" && selectedWord === elem
                    ? selectedWord === parentWords
                      ? "#58CC02"
                      : "#C30303"
                    : "#333F61",
                fontWeight: 600,
                fontSize: "32px",
                fontFamily: "Quicksand",
              }}
            >
              {elem}
            </span>
          </Box>
        ))}
      </Box>
      {
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <VoiceAnalyser
            pageName={"m6"}
            setRecordedAudio={setRecordedAudio}
            setVoiceAnimate={setVoiceAnimate}
            storyLine={storyLine}
            dontShowListen={true}
            // updateStory={updateStory}
            originalText={parentWords}
            {...{
              contentId,
              contentType,
              currentLine: currentStep - 1,
              callUpdateLearner,
              isShowCase,
              showOnlyListen: selectedWord != wordToCheck,
              setOpenMessageDialog,
            }}
          />
        </Box>
      }
      {/* <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: "22px",
          cursor: selectedWord ? "pointer" : "not-allowed",
        }}
        onClick={handleNext}
      >
        <SubmitButton opacity={selectedWord ? 1 : 0.3} />
      </Box> */}
    </MainLayout>
  );
};

export default Mechanics2;
