import React from 'react';
import { ParticipantProfile } from './ParticipantProfile';

/**
 * ParticipantProgress is now merged into ParticipantProfile ("My Profile").
 * This alias ensures backwards compatibility across the application.
 */
export const ParticipantProgress: React.FC = () => {
  return <ParticipantProfile />;
};

export default ParticipantProgress;
