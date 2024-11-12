import { Box, Grid, Typography, Modal } from "@mui/material";
import React, { createRef, useContext, useEffect, useState } from "react";
import {
  AudioBarColoredSvg,
  AudioBarSvg,
  AudioPlayerSvg,
  PlayAudioButton,
  StopAudioButton,
  getLocalData,
} from "../../utils/constants";
import MainLayout from "../Layouts.jsx/MainLayout";
import correctSound from "../../assets/audio/correct.wav";
import wrongSound from "../../assets/audio/wrong.wav";
import removeSound from "../../assets/audio/remove.wav";
import VoiceAnalyser from "../../utils/VoiceAnalyser";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import CloseIcon from "@mui/icons-material/Close";
import { MyContext } from "../../views/Practice/Practice";

// TODO: update it as per File name OR update file name as per export variable name
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
  options,
  audio,
}) => {
  const { enableNext, setEnableNext } = useContext(MyContext) || {};

  const [words, setWords] = useState([]);
  const [sentences, setSentences] = useState([]);
  const [zoomOpen, setZoomOpen] = useState(false);
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

  //console.log('Mechanics3', answer);

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

  // TODO: Constants declaration Need to move up
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

  // TODO: all the constants declaration Need to move up
  const [currrentProgress, setCurrrentProgress] = React.useState(0);
  const progressBarWidth = Number.isNaN(currrentProgress / duration)
    ? 0
    : currrentProgress / duration;

  return (
    <MainLayout
      background={background}
      showTimer={showTimer}
      points={points}
      pageName={"m3"}
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
            <Grid
              item
              xs={4}
              sx={{
                position: {
                  xs: "relative", // For extra small screens
                  sm: "relative", // For small screens
                  md: "relative", // For medium screens
                  lg: "relative", // Change as needed for large screens
                  xl: "relative", // Change as needed for extra-large screens
                },
                left: {
                  xs: 0, // For extra small screens
                  sm: 0, // For small screens
                  md: "0px", // Adjust position for medium screens
                  lg: "0px",
                  xl: "0px",
                },
              }}
            >
              <Box sx={{ position: "relative", cursor: "zoom-in" }}>
                {image && (
                  <img
                    onClick={() => setZoomOpen(true)}
                    src={image}
                    style={{
                      borderRadius: "20px",
                      maxWidth: "100%",
                      height: "clamp(150px, 20vw, 220px)",
                    }}
                    alt=""
                  />
                )}

                {/* Subtle gradient overlay across the top */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "40px", // Height of the gradient overlay
                    background:
                      "linear-gradient(to bottom, rgba(0, 0, 0, 0.4), transparent)",
                    borderTopLeftRadius: "20px",
                    borderTopRightRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: "8px",
                  }}
                >
                  {/* Zoom icon positioned in the top-left corner */}
                  <ZoomInIcon
                    onClick={() => setZoomOpen(true)}
                    sx={{ color: "white", fontSize: "22px", cursor: "pointer" }}
                  />
                </Box>
              </Box>
              <Modal
                open={zoomOpen}
                onClose={() => setZoomOpen(false)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    outline: "none",
                    height: "500px",
                    width: "500px",
                  }}
                >
                  {/* Subtle gradient overlay at the top of the zoomed image */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "40px", // Adjust height as needed
                      background:
                        "linear-gradient(to bottom, rgba(0, 0, 0, 0.4), transparent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      paddingRight: "8px",
                      borderTopLeftRadius: "8px",
                      borderTopRightRadius: "8px",
                    }}
                  >
                    {/* Close icon positioned within the gradient overlay */}
                    <CloseIcon
                      onClick={() => setZoomOpen(false)}
                      sx={{
                        color: "white",
                        fontSize: "24px",
                        cursor: "pointer",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        borderRadius: "50%",
                        padding: "4px",
                      }}
                    />
                  </Box>

                  <img
                    src={image}
                    alt="Zoomed content"
                    style={{
                      // maxWidth: "90vw",
                      // maxHeight: "90vh",
                      // height:"500px",
                      width: "100%",
                      borderRadius: "8px",
                    }}
                  />
                </Box>
              </Modal>
            </Grid>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: { xs: "20px", sm: "40px" },
                width: "75%",
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
                    {parentWords?.split(/_+/)[0]}
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
                    {parentWords?.split(/_+/)[1]}
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
          flexWrap: "wrap",
        }}
      >
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
            pageName={"m3"}
            setRecordedAudio={setRecordedAudio}
            setVoiceAnimate={setVoiceAnimate}
            storyLine={storyLine}
            dontShowListen={type === "image" || isDiscover}
            // updateStory={updateStory}
            originalText={parentWords}
            audioLink={audio ? audio : null}
            {...{
              contentId,
              contentType,
              currentLine: currentStep - 1,
              callUpdateLearner,
              isShowCase,
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
