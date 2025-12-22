import Banner from '@/components/atomic/Layout/Banner';
import Row from '@/components/atomic/Layout/Row';
import ScreenContainer from '@/components/atomic/Layout/ScreenContainer';
import ScrollScreen from '@/components/atomic/Layout/ScrollScreen';
import BodyText from '@/components/atomic/Typography/BodyText';
import Subtitle from '@/components/atomic/Typography/Subtitle';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

import React, { useState } from 'react';
import { LayoutAnimation, Platform, StyleSheet, TouchableOpacity, UIManager, View } from 'react-native';

// Import images as constants - using relative paths for Expo Go compatibility
const run1Image = require('../assets/images/run1.png');
const run2Image = require('../assets/images/run2.png');
const run3Image = require('../assets/images/run3.png');

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TipsScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <ScrollScreen>
        <ContentWrapper>
          <Banner
            title="Tips for Better Analysis"
            onBackPress={() => router.back()}
          />

          <Subtitle style={styles.headerSubtitle}>
            Get the most accurate feedback by following these video and form tips.
          </Subtitle>

          
          
          {/* -------------------- VIDEO QUALITY TIP KARTLARI -------------------- */}

          <View style={styles.previewBlock}>
            <Subtitle style={styles.imageTitle}>Start from an edge</Subtitle>
            <Image
              source={run1Image}
              style={styles.previewImage}
              contentFit="contain"
            />
          </View>

          <View style={styles.previewBlock}>
            <Subtitle style={styles.imageTitle}>Keep running!</Subtitle>
            <Image
              source={run2Image}
              style={styles.previewImage}
              contentFit="contain"
            />
          </View>

          <View style={styles.previewBlock}>
            <Subtitle style={styles.imageTitle}>...and finish the scene</Subtitle>
            <Image
              source={run3Image}
              style={styles.previewImage}
              contentFit="contain"
            />
          </View>

          <QualityTipCard
            icon="sunny-outline"
            title="Lighting & Visibility"
            description="Record in a bright environment where your whole body is clearly visible."
            bullets={[
              'Avoid strong backlight.',
              'Make sure your face, hips, knees and feet are not in the dark.',
              'Prefer natural daylight or evenly distributed indoor light.',
            ]}
            //relatedCheck="lighting_check"
          />

          <QualityTipCard
            icon="videocam-outline"
            title="Camera Position & Angle"
            description="Place the camera so we can see your full body during the whole movement."
            bullets={[
              'Camera should be placed to a sttable surface or should be gripped by a tripod.',
              'The height of the camera should be above at least 0.5 meter above the ground, at most 1.5 meter.',
              'Stand in the left or right side of the scene and start to run until other edge of the scene.',
              'Avoid front or back angles.The best angle is side view (90 degrees).',
              'Make sure the camera is not tilted too much (keep it level).',
            ]}
            //relatedCheck="framing_and_visibility_check"
          />

          <QualityTipCard
            icon="people-outline"
            title="One Athlete, Clear Background"
            description="The model should focus only on you with minimal distractions in the background. These tips are not mandatory but help improve accuracy."
            bullets={[
              'Only one person should be visible in the frame.',
              'Avoid crowded pists and mirrors directly behind you.',
              'Choose a simple background (if possible).',
            ]}
            //relatedCheck="single_person_check"
          />

          

        

          <QualityTipCard
            icon="image-outline"
            title="Orientation & Duration"
            description="Use a clear orientation and enough frames for reliable analysis."
            bullets={[
              'Use the recommended orientation (portrait or landscape) shown in the app.',
              'Record for the whole set or at least 3-5 seconds.',
              'Avoid super short clips under a few seconds.',
            ]}
            //relatedCheck="aspect_ratio_and_duration_check"
          />

          

          {/* -------------------- FORM / KOŞU / HAREKET TAVSİYELERİ (AKORDİYON) -------------------- */}
          <SectionTitle style={{ marginTop: 20 }}>Form & Movement Tips</SectionTitle>

          <AccordionSection
            title="Running Posture Tips"
            items={[
              "Keep your head neutral and look forward — avoid looking down at your shoes.",
              "Maintain a tall posture with your chest open to support proper breathing.",
              "Lean slightly forward from the ankles, not the waist or lower back.",
              "Keep your hips stable and centered under your body.",
            ]}
          />

          <AccordionSection
            title="Foot Strike & Cadence Tips"
            items={[
              "Aim to land softly under your center of mass — avoid overstriding.",
              "Your foot should land beneath your hips instead of far in front.",
              "Try to keep a consistent cadence between 160–180 steps per minute.",
              "Focus on quick, light steps rather than long, heavy strides.",
            ]}
          />

          <AccordionSection
            title="Upper Body Mechanics Tips"
            items={[
              "Relax your shoulders — avoid shrugging or tightening your neck.",
              "Keep your arms bent around 90°, swinging naturally front to back.",
              "Avoid crossing your arms across your chest; keep movement in the sagittal plane.",
              "Let your hands stay relaxed — imagine holding a chip without crushing it.",
            ]}
          />

          <AccordionSection
            title="Breathing Tips"
            items={[
              "Use rhythmic breathing (e.g., inhale for 2 steps, exhale for 2 steps).",
              "Keep your chest open to allow deeper, more efficient breaths.",
              "Breathe through both your nose and mouth during moderate and fast runs.",
              "Avoid shallow breathing — focus on belly expansion, not just chest rise.",
            ]}
          />

          <AccordionSection
            title="Common Running Mistakes to Avoid"
            items={[
              "Avoid overstriding, which increases impact and slows you down.",
              "Do not lean too far forward or backward — it disrupts balance.",
              "Avoid clenching fists or stiffening your shoulders.",
              "Do not bounce excessively; vertical oscillation wastes energy.",
              "Don’t look down constantly — it affects posture and stride.",
            ]}
          />

        </ContentWrapper>
      </ScrollScreen>
    </ScreenContainer>
  );
}

/* -------------------------------------------------------------------------- */
/*                               REUSABLE PARTS                               */
/* -------------------------------------------------------------------------- */

type QualityTipCardProps = {
  icon: string;
  title: string;
  description: string;
  bullets: string[];
  relatedCheck?: string;
};

function QualityTipCard({
  icon,
  title,
  description,
  bullets,
  relatedCheck,
}: QualityTipCardProps) {
  return (
    <View style={styles.card}>
      <Row style={styles.cardHeaderRow}>
        <Ionicons name={icon as any} size={24} />
        <Subtitle style={styles.cardTitle}>{title}</Subtitle>
      </Row>

      {relatedCheck && (
        <BodyText style={styles.relatedCheckText}>
          Related check: <BodyText style={{ fontWeight: '600' }}>{relatedCheck}</BodyText>
        </BodyText>
      )}

      <BodyText style={styles.cardDescription}>{description}</BodyText>

      <View style={styles.bulletList}>
        {bullets.map((b, index) => (
          <Row key={index} style={styles.bulletRow}>
            <BodyText style={styles.bulletDot}>{'\u2022'}</BodyText>
            <BodyText style={styles.bulletText}>{b}</BodyText>
          </Row>
        ))}
      </View>
    </View>
  );
}

type AccordionSectionProps = {
  title: string;
  items: string[];
};

function AccordionSection({ title, items }: AccordionSectionProps) {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((prev) => !prev);
  };

  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity style={styles.accordionHeader} onPress={toggle} activeOpacity={0.7}>
        <Subtitle style={styles.accordionTitle}>{title}</Subtitle>
        <Ionicons
          name={open ? 'chevron-up-outline' : 'chevron-down-outline'}
          size={20}
        />
      </TouchableOpacity>

      {open && (
        <View style={styles.accordionContent}>
          {items.map((item, idx) => (
            <Row key={idx} style={styles.bulletRow}>
              <BodyText style={styles.bulletDot}>{'\u2022'}</BodyText>
              <BodyText style={styles.bulletText}>{item}</BodyText>
            </Row>
          ))}
        </View>
      )}
    </View>
  );
}

function SectionTitle({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <Subtitle style={[styles.sectionTitle, style]}>
      {children}
    </Subtitle>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   STYLES                                   */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  headerSubtitle: {
    marginBottom: 12,
  },
  infoAlert: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 16,
    boxShadow: '0px 2px 6px 0px rgba(0, 0, 0, 0.06)',
    elevation: 2,
    marginBottom: 12,
  },
  cardHeaderRow: {
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    marginLeft: 8,
  },
  relatedCheckText: {
    marginBottom: 4,
    opacity: 0.7,
  },
  cardDescription: {
    marginBottom: 6,
  },
  bulletList: {
    marginTop: 4,
  },
  bulletRow: {
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  bulletDot: {
    marginRight: 6,
  },
  bulletText: {
    flex: 1,
  },
  accordionContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 8,
    boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.04)',
    elevation: 1,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accordionTitle: {
    flex: 1,
    marginRight: 8,
  },
  accordionContent: {
    marginTop: 6,
  },
  previewBlock: {
    marginBottom: 12,
  },
  imageTitle: {
    marginBottom: 6,
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginBottom: 0,
    backgroundColor: '#000',
  },
  

});

function ContentWrapper({ children }: { children: React.ReactNode }) {
  return (
    <View style={contentStyles.wrapper}>
      {children}
    </View>
  );
}

const contentStyles = StyleSheet.create({
  wrapper: {
    width: '100%',
    maxWidth: 600, // tablet ve büyük ekranlarda çok genişlemesin
    alignSelf: 'center',
    paddingHorizontal: 8, // sağ-sol boşluk
  },
});


