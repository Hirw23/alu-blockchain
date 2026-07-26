import emailjs from '@emailjs/browser';

const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';
const welcomeTemplateId = import.meta.env.VITE_EMAILJS_WELCOME_TEMPLATE_ID || '';
const resetTemplateId = import.meta.env.VITE_EMAILJS_RESET_TEMPLATE_ID || '';

/**
 * Sends a welcome/email verification email using EmailJS.
 * Template variables: {{email}}, {{link}}, {{name}}
 */
export const sendVerificationEmail = async (toEmail, toName, token) => {
  const verificationLink = `${window.location.origin}/verify-email?token=${token}`;

  if (!serviceId || !publicKey || !welcomeTemplateId) {
    console.warn('[EmailJS] Missing configuration. Verification email simulation:', {
      email: toEmail,
      name: toName,
      link: verificationLink,
    });
    return;
  }

  const templateParams = {
    email: toEmail,
    name: toName,
    link: verificationLink,
  };

  try {
    const result = await emailjs.send(serviceId, welcomeTemplateId, templateParams, publicKey);
    console.log('[EmailJS] Verification email sent successfully:', result.text);
    return result;
  } catch (error) {
    console.error('[EmailJS] Failed to send verification email:', error);
    throw error;
  }
};

/**
 * Sends a password reset email using EmailJS.
 * Template variables: {{email}}, {{link}}, {{name}}
 */
export const sendPasswordResetEmail = async (toEmail, toName, token) => {
  const resetLink = `${window.location.origin}/reset-password?token=${token}`;

  if (!serviceId || !publicKey || !resetTemplateId) {
    console.warn('[EmailJS] Missing configuration. Password reset email simulation:', {
      email: toEmail,
      name: toName,
      link: resetLink,
    });
    return;
  }

  const templateParams = {
    email: toEmail,
    name: toName,
    link: resetLink,
  };

  try {
    const result = await emailjs.send(serviceId, resetTemplateId, templateParams, publicKey);
    console.log('[EmailJS] Password reset email sent successfully:', result.text);
    return result;
  } catch (error) {
    console.error('[EmailJS] Failed to send password reset email:', error);
    throw error;
  }
};
