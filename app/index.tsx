import React, { useState } from "react";

// Layout
import Column from "../components/atomic/Layout/Column";
import Row from "../components/atomic/Layout/Row";
import ScrollScreen from "../components/atomic/Layout/ScrollScreen";

// Typography
import BodyText from "../components/atomic/Typography/BodyText";
import Subtitle from "../components/atomic/Typography/Subtitle";
import Title from "../components/atomic/Typography/Title";

// Buttons
import GoogleButton from "../components/atomic/Button/GoogleButton";
import IconButton from "../components/atomic/Button/IconButton";
import PrimaryButton from "../components/atomic/Button/PrimaryButton";
import SecondaryButton from "../components/atomic/Button/SecondaryButton";

// Inputs
import Dropdown from "../components/atomic/Inputs/Dropdown";
import PasswordInput from "../components/atomic/Inputs/PasswordInput";
import TextInputField from "../components/atomic/Inputs/TextInputField";
import VerificationCodeInput from "../components/atomic/Inputs/VerificationCodeInput";

// Feedback
import ErrorAlert from "../components/atomic/Feedback/ErrorAlert";
import InfoAlert from "../components/atomic/Feedback/InfoAlert";
import LoadingSpinner from "../components/atomic/Feedback/LoadingSpinner";
import ProgressBar from "../components/atomic/Feedback/ProgressBar";

// 🔹 Composite: Upload
import CameraRecordButton from "../components/composite/Upload/CameraRecordButton";
import GalleryPickerButton from "../components/composite/Upload/GalleryPickerButton";
import VideoSourceCard from "../components/composite/Upload/VideoSourceCard";

// 🔹 Composite: History
import BodyPartSelector from "../components/composite/History/BodyPartSelector";
import IntervalSelector from "../components/composite/History/IntervalSelector";
import MetricCard from "../components/composite/History/MetricCard";

// 🔹 Composite: Tips
import AccordionItem from "../components/composite/Tips/AccordionItem";

const UIPlayground = () => {
  // atomic test state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [dropdownValue, setDropdownValue] = useState<string | null>(null);
  const [progress, setProgress] = useState(0.3);
  const [loading, setLoading] = useState(false);

  // composite test state
  const [interval, setInterval] = useState<string | null>(null);
  const [bodyPart, setBodyPart] = useState<string | null>("Full body");

  return (
    <ScrollScreen>
      <Column style={{ gap: 24 }}>
        {/* ====================== ATOMIC TEST ====================== */}
        <Column style={{ gap: 8 }}>
          <Title>Runalyst UI Playground</Title>
          <Subtitle>Atomic components test screen</Subtitle>
          <BodyText>
            Bu ekranda önce atomic componentleri, ardından composite componentlerden
            bazılarını test ediyorsun.
          </BodyText>
        </Column>

        {/* BUTTONS */}
        <Column style={{ gap: 8 }}>
          <Subtitle>Buttons (atomic)</Subtitle>
          <PrimaryButton
            title={loading ? "Loading..." : "Primary Button"}
            onPress={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1500);
            }}
            loading={loading}
          />
          <SecondaryButton
            title="Secondary Button"
            onPress={() => console.log("Secondary pressed")}
          />
          <Row style={{ alignItems: "center", justifyContent: "flex-start", gap: 8 }}>
            <IconButton
              icon="settings-outline"
              onPress={() => console.log("Icon pressed")}
            />
            <BodyText>Icon Button (settings-outline)</BodyText>
          </Row>
          <GoogleButton onPress={() => console.log("Google login")} />
        </Column>

        {/* INPUTS */}
        <Column style={{ gap: 12 }}>
          <Subtitle>Inputs (atomic)</Subtitle>

          <TextInputField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
          />

          <PasswordInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
          />

          <VerificationCodeInput
            label="Verification Code"
            value={code}
            onChangeText={setCode}
          />

          <Dropdown
            label="Generic Dropdown"
            selectedValue={dropdownValue}
            onSelect={setDropdownValue}
            options={["Option A", "Option B", "Option C"]}
            placeholder="Select option"
          />
        </Column>

        {/* FEEDBACK */}
        <Column style={{ gap: 12 }}>
          <Subtitle>Feedback (atomic)</Subtitle>

          <InfoAlert message="This is an informational alert. Good for tips or guidance." />
          <ErrorAlert message="This is an error alert. Something went wrong." />

          <BodyText>Analysis Progress: {(progress * 100).toFixed(0)}%</BodyText>
          <ProgressBar progress={progress} />

          <Row style={{ gap: 8, marginTop: 4 }}>
            <SecondaryButton
              title="Decrease"
              onPress={() => setProgress((p) => Math.max(0, p - 0.1))}
              style={{ flex: 1 }}
            />
            <SecondaryButton
              title="Increase"
              onPress={() => setProgress((p) => Math.min(1, p + 0.1))}
              style={{ flex: 1 }}
            />
          </Row>

          <BodyText>Loading Spinner:</BodyText>
          <LoadingSpinner />
        </Column>

        {/* ====================== COMPOSITE TEST ====================== */}

        {/* 1) Upload: VideoSourceCard + Gallery/Camera */}
        <Column style={{ gap: 8 }}>
          <Subtitle>Composite: Upload / VideoSourceCard</Subtitle>
          <VideoSourceCard
            title="Choose video source"
            description="Simulated upload source selection"
          >
            <GalleryPickerButton onPress={() => console.log("Open gallery")} />
            <CameraRecordButton onPress={() => console.log("Open camera")} />
          </VideoSourceCard>
        </Column>

        {/* 2) History: IntervalSelector */}
        <Column style={{ gap: 8 }}>
          <Subtitle>Composite: History / IntervalSelector</Subtitle>
          <IntervalSelector
            selectedValue={interval}
            onSelect={(v) => {
              console.log("Interval selected:", v);
              setInterval(v);
            }}
          />
        </Column>

        {/* 3) History: BodyPartSelector */}
        <Column style={{ gap: 8 }}>
          <Subtitle>Composite: History / BodyPartSelector</Subtitle>
          <BodyPartSelector
            selectedPart={bodyPart}
            onSelect={(part) => {
              console.log("Body part selected:", part);
              setBodyPart(part);
            }}
          />
        </Column>

        {/* 4) History: MetricCard */}
        <Column style={{ gap: 8 }}>
          <Subtitle>Composite: History / MetricCard</Subtitle>
          <Row style={{ gap: 10 }}>
            <MetricCard
              label="Cadence"
              value="172"
              unit="steps/min"
              trend="up"
              trendText="Better than last run"
              style={{ flex: 1 }}
            />
            <MetricCard
              label="Ground contact"
              value="260"
              unit="ms"
              trend="down"
              trendText="Slightly increased"
              style={{ flex: 1 }}
            />
          </Row>
        </Column>

        {/* 5) Tips: AccordionItem */}
        <Column style={{ gap: 8, marginBottom: 32 }}>
          <Subtitle>Composite: Tips / AccordionItem</Subtitle>
          <AccordionItem title="Camera angle tip">
            Always place your camera at hip height and make sure your full body is visible
            during the entire run cycle.
          </AccordionItem>
          <AccordionItem title="Lighting tip">
            Prefer shooting in daylight or in a well-lit area to help the model track your
            joints accurately.
          </AccordionItem>
        </Column>
      </Column>
    </ScrollScreen>
  );
};

export default UIPlayground;
