import { z } from 'zod';

const UnverifiedEmail = z.string().email().brand<'UnverifiedEmail'>();
const VerifiedEmail = z.string().email().brand<'VerifiedEmail'>();
export const CustomerEmail = z.union([UnverifiedEmail, VerifiedEmail]);

type UnverifiedEmail = z.infer<typeof UnverifiedEmail>;
type VerifiedEmail = z.infer<typeof UnverifiedEmail>;
export type CustomerEmail = z.infer<typeof CustomerEmail>;

type Customer = {
  email: VerifiedEmail;
};

type UnverifiedCustomer = {
  email: UnverifiedEmail;
};

export function sendVerificationEmail(email: UnverifiedEmail): void {}

export function sendPasswordResetEmail(email: VerifiedEmail): void {}

export function changeEmail(customer: Customer, newEmail: UnverifiedEmail): UnverifiedCustomer {
  return { ...customer, email: newEmail };
}
