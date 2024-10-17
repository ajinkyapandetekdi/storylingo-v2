import { Box, Grid, Typography } from "@mui/material";
import HomophonesFinder from "homophones";
import React, { createRef, useEffect, useState } from "react";
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
import removeSound from "../../assets/audio/remove.wav";
import VoiceAnalyser from "../../utils/VoiceAnalyser";

const Mechanics2 = ({
  page,
  setPage,
  type,
  handleNext,
  background,
  header,
  parentWords,
  image,
  setVoiceText,
  setRecordedAudio,
  setVoiceAnimate,
  storyLine,
  enableNext,
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
  playTeacherAudio = () => {},
  callUpdateLearner,
  disableScreen,
  isShowCase,
  handleBack,
  allWords,
  setEnableNext,
  loading,
  setOpenMessageDialog,
  options,
  audio,
}) => {
  const [words, setWords] = useState([]);
  const [sentences, setSentences] = useState([]);

  const [selectedWord, setSelectedWord] = useState("");
  // const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [wordToFill, setWordToFill] = useState("");
  const [disabledWords, setDisabledWords] = useState(false);
  const [answer, setAnswer] = useState({
    text: "",
    audio_url: "",
    image_url: "",
    isAns: false,
  });

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
          // wordsArr[randomIndex] = "dash";
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

  useEffect(() => {
    if (!enableNext) {
      setAnswer({ text: "", audio_url: "", image_url: "", isAns: false });
    }
  }, [parentWords]);

  const handleAnswerFillInTheBlank = (word) => {
    setAnswer(word);

    const isSoundCorrect = word.isAns;
    let audio = new Audio(isSoundCorrect ? correctSound : wrongSound);
    if (!isSoundCorrect) {
      setEnableNext(false);
    }
    audio.play();
    setShake(true);
    setTimeout(() => {
      setShake(false);
    }, 800);
  };

  const handleRemoveWord = () => {
    let audio = new Audio(removeSound);
    setAnswer({ text: "", audio_url: "", image_url: "", isAns: false });
    audio.play();
    setEnableNext(false);
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
  const progressBarWidth = Number.isNaN(currrentProgress / duration)
    ? 0
    : currrentProgress / duration;

  const getEnableButton = () => {
    if (type === "fillInTheBlank") {
      return enableNext;
    }
    if (type === "audio") {
      return selectedWord === wordToCheck;
    }
    return false;
  };
  return (
    <MainLayout
      background={background}
      handleNext={handleNext}
      enableNext={getEnableButton()}
      showTimer={showTimer}
      points={points}
      {...{
        steps,
        currentStep,
        level,
        progressData,
        showProgress,
        playTeacherAudio,
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
            <Grid
              item
              xs={4}
              sx={{
                position: {
                  xs: "relative", // For extra small screens
                  sm: "relative", // For small screens
                  md: "relative", // For medium screens
                  lg: "absolute", // Change as needed for large screens
                  xl: "absolute", // Change as needed for extra-large screens
                },
                left: {
                  xs: 0, // For extra small screens
                  sm: 0, // For small screens
                  md: "-40px", // Adjust position for medium screens
                  lg: "40px",
                },
                mt: {
                  lg: "300px",
                },
              }}
            >
              {image && (
                <img
                  src={image}
                  style={{
                    borderRadius: "20px",
                    maxWidth: "100%",
                    height: "250px",
                  }}
                  alt=""
                />
              )}
            </Grid>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: { xs: "20px", sm: "40px" }, // Add margin-top to create space below the image
              }}
            >
              <Typography
                variant="h5"
                component="h4"
                sx={{
                  mb: { xs: 2, sm: 3, md: 4 },
                  fontSize: { xs: "24px", sm: "32px", md: "40px" },
                  color: "#303050",
                  textAlign: "center",
                  fontFamily: "Quicksand",
                  lineHeight: "normal",
                }}
              >
                {answer?.text !== "" ? (
                  <>
                    {parentWords?.split("_____")[0]} {/* Before the blank */}
                    <span
                      className={!answer.isAns && shake ? "shakeImage" : ""}
                      style={{
                        color: answer.isAns ? "#58CC02" : "#C30303",
                        border: answer.isAns
                          ? "2px solid #58CC02"
                          : "2px solid rgb(195, 3, 3)",
                        borderBottom: answer.isAns
                          ? "2px solid #58CC02"
                          : "2px solid rgb(195, 3, 3)",
                        borderRadius: "10px",
                        padding: "10px",
                        cursor: "pointer",
                        display: "inline-block",
                      }}
                      onClick={handleRemoveWord}
                    >
                      {answer?.text}
                    </span>
                    {parentWords?.split("_____")[1]} {/* After the blank */}
                  </>
                ) : (
                  <>{parentWords}</>
                )}
              </Typography>
            </Box>
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
        {type === "audio" &&
          words?.map((elem, ind) => (
            <Box
              key={ind}
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
        <>
          {type === "fillInTheBlank" &&
            Array.isArray(options) &&
            options.map(
              (elem, ind) =>
                answer?.text !== elem.text && (
                  <Box
                    key={ind}
                    className={`${
                      type === "audio" && selectedWord === elem
                        ? selectedWord === parentWords
                          ? `audioSelectedWord`
                          : `audioSelectedWrongWord ${
                              shake ? "shakeImage" : ""
                            }`
                        : ""
                    }`}
                    onClick={() => handleAnswerFillInTheBlank(elem)}
                    sx={{
                      textAlign: "center",
                      px: { xs: "10px", sm: "20px", md: "25px" }, // Responsive padding
                      py: { xs: "8px", sm: "10px", md: "12px" }, // Responsive padding
                      m: 1,
                      textTransform: "none",
                      borderRadius: "12px",
                      border: `1px solid rgba(51, 63, 97, 0.10)`,
                      background: "#FFF",
                      cursor: "pointer",
                      opacity: disabledWords ? 0.25 : 1,
                      pointerEvents: disabledWords ? "none" : "initial",
                      display: "flex", // Flex display for better alignment
                      justifyContent: "center", // Centering text
                      alignItems: "center", // Centering text vertically
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
                        fontSize: "30px", // Responsive font size
                        fontFamily: "Quicksand",
                      }}
                    >
                      {elem?.text}
                    </span>
                  </Box>
                )
            )}
        </>
      </Box>
      {
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <VoiceAnalyser
            setVoiceText={setVoiceText}
            setRecordedAudio={setRecordedAudio}
            setVoiceAnimate={setVoiceAnimate}
            storyLine={storyLine}
            dontShowListen={type === "image" || isDiscover}
            // updateStory={updateStory}
            originalText={parentWords}
            enableNext={getEnableButton()}
            handleNext={handleNext}
            audioLink={audio ? audio : null}
            {...{
              contentId,
              contentType,
              currentLine: currentStep - 1,
              playTeacherAudio,
              callUpdateLearner,
              isShowCase,
              setEnableNext,
              showOnlyListen: !answer?.isAns,
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
