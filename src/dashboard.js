import "./dashboard.css";
import axios from "axios";
import Header from "./Components/Header";
import React, { useState, useContext, useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import Loader from "./Components/Loader";
import { SocketContext } from "./SocketContext";

const CAMERA_API_URL = `${process.env.REACT_APP_CAMERA_BACKEND}`;
const PYTHON_API_URL = `${process.env.REACT_APP_PYTHON_BACKEND}`;

const Dashboard = () => {
  const socket = useContext(SocketContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [imageCount, setImageCount] = useState(0);
  const [defects, setDefects] = useState(0);
  const [missing, setMissing] = useState(0);
  const [time, setTime] = useState(null);

  useEffect(() => {
    socket.on("react-output", (data) => {
      setResult(data?.info);
      setTime(data?.time);
      let missingele = 0;
      let defectsele = 0;
      Object.values(data?.info).forEach((element) => {
        if (!element[0]) missingele++;
        if (element[0] && element[1] > 1.2) defectsele++;
      });
      setMissing(missingele);
      setDefects(defectsele);
      setIsLoading(false);
    });
  }, [socket]);

  const handleImageCapture = async () => {
    setSelectedFile(null);
    setImageCount(imageCount + 1);
    setIsLoading(true);
    const res = await axios.get(`${CAMERA_API_URL}/image`);
    setIsLoading(false);
    setSelectedFile(res.data.data.name);
  };

  const handleStartQC = async () => {
    setIsLoading(true);
    await axios.get(`${PYTHON_API_URL}/analysis`);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setTime(null);
    setImageCount(imageCount + 1);
    setDefects(0);
    setMissing(0);
  };

  return (
    <>
      {isLoading ? <Loader /> : null}
      <Header />
      <div className="image-container">
        <Row>
          <Col>
            <p style={{ textAlign: "center" }}>Input from Assembly Line</p>
          </Col>
          <Col>
            <p style={{ textAlign: "center" }}>Post Analysis</p>
          </Col>
        </Row>
        <Row>
          <Col
            className="image-div"
            style={{
              marginRight: "10px",
              height: selectedFile ? "auto" : "400px",
            }}
          >
            {selectedFile && (
              <img
                src={`${CAMERA_API_URL}/images?params=${selectedFile}&args=${imageCount}`}
                alt={imageCount}
              />
            )}
          </Col>
          <Col className="image-div" style={{ marginLeft: "10px" }}>
            {result && (
              <img
                src={`${PYTHON_API_URL}/images?params=automobile_result.bmp&args=${imageCount}`}
                alt={imageCount}
              />
            )}
          </Col>
        </Row>
      </div>
      {result ? (
        <div className="result">
          <div
            className="parts"
            style={{ color: missing > 0 ? "red" : "green" }}
          >
            {missing > 0 ? `${missing} Parts Missing` : "All Parts Present"}
          </div>
          <div className="test-result">
            {defects + missing > 0
              ? `QC Failed - ${defects + missing} Issues Found`
              : "QC Passed"}
          </div>
          <div className="processing-time">
            Processing Time: {time && time?.toFixed(2)} sec
          </div>
          <button
            type="button"
            className="btn btn-primary px-4 py-2 rounded mt-2"
            onClick={handleReset}
          >
            Process Next
          </button>
        </div>
      ) : (
        <div className="text-center mb-4">
          <button
            type="button"
            className={`btn btn-${selectedFile !== null ? "danger" : "primary"
              } px-4 py-2 rounded`}
            onClick={handleImageCapture}
          >
            {selectedFile !== null ? "Retake" : "Start Test"}
          </button>
          <br />
          {selectedFile && (
            <button
              type="button"
              className={`btn btn-primary px-4 py-2 rounded mt-2`}
              onClick={handleStartQC}
            >
              Start QC
            </button>
          )}
        </div>
      )}
      {result && (
        <div className="tableData" style={{ marginTop: "40px" }}>
          <div className="d-flex justify-content-between align-items-center">
            <span className="logboook">QC Analysis</span>
          </div>
          <div className="table-cont" style={{ marginTop: "20px" }}>
            <div
              style={{ width: "35%", color: "#52575C", textAlign: "center" }}
            >
              Part Name
            </div>
            <div style={{ color: "#52575C", textAlign: "center" }}>
              Dimension (mm)
            </div>
            <div style={{ color: "#52575C", textAlign: "center" }}>Present</div>
            <div style={{ color: "#52575C", textAlign: "center" }}>
              Deviation (mm)
            </div>
          </div>
          {Object.keys(result).map((key, i) => {
            return (
              <div className="table-cont" key={i}>
                <div
                  style={{ width: "35%", color: "gray", textAlign: "center" }}
                >
                  {key}
                </div>
                <div
                  style={{
                    color: "gray",
                    fontSize: "14px",
                    textAlign: "center",
                  }}
                >
                  {result[key][0] && result[key].length > 2
                    ? result[key][2]
                    : "---"}
                </div>
                <div
                  style={{
                    color: `${result[key][0] ? "green" : "red"}`,
                    fontSize: "14px",
                    textAlign: "center",
                  }}
                >
                  {result[key][0] ? "True" : "False"}
                </div>
                <div
                  style={{
                    color: `${result[key][0]
                        ? result[key][1] <= 1.2
                          ? "gray"
                          : "red"
                        : "gray"
                      }`,
                    fontSize: "14px",
                    textAlign: "center",
                  }}
                >
                  {result[key][0] ? result[key][1] : "---"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default Dashboard;
