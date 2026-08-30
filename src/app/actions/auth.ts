'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export interface AuthResult {
  success: boolean;
  error?: string;
}

/**
 * Create an account: Supabase auth user + a customer row linked to it,
 * plus the first (default) address.
 */
export async function signUpWithEmailPassword(input: {
  full_name: string;
  email: string;
  password: string;
  phone_whatsapp: string;
  city: string;
  address: string;
}): Promise<AuthResult> {
  const email = input.email?.trim().toLowerCase();
  const password = input.password;
  if (!input.full_name?.trim()) return { success: false, error: 'Full name is required.' };
  if (!email) return { success: false, error: 'Email is required.' };
  if (!password || password.length < 6)
    return { success: false, error: 'Password must be at least 6 characters.' };
  if (!input.phone_whatsapp?.trim())
    return { success: false, error: 'WhatsApp number is required.' };
  if (!input.city) return { success: false, error: 'City is required.' };
  if (!input.address?.trim()) return { success: false, error: 'Address is required.' };

  const supabase = await createClient();

  const { data: authData, error: signUpError } =
    await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: input.full_name.trim(),
          phone_whatsapp: input.phone_whatsapp.trim(),
        },
      },
    });

  if (signUpError || !authData.user) {
    return { success: false, error: signUpError?.message ?? 'Sign up failed.' };
  }

  const admin = createAdminClient();

  const phone = input.phone_whatsapp.trim();

  // Find any existing customer row for this phone (e.g. created during a
  // guest checkout). If one exists, link it to the new auth user instead of
  // inserting a duplicate (phone_whatsapp is unique).
  const { data: existing, error: existingError } = await admin
    .from('customers')
    .select('id, email')
    .eq('phone_whatsapp', phone)
    .maybeSingle();

  if (existingError) {
    return { success: false, error: `Failed to look up profile: ${existingError.message}` };
  }

  let customerId: string;
  if (existing) {
    if (existing.email && existing.email !== email) {
      return {
        success: false,
        error:
          'This phone number is already linked to another account. Please sign in with that account or use a different phone number.',
      };
    }
    const { data: updated, error: updateError } = await admin
      .from('customers')
      .update({
        email,
        auth_user_id: authData.user.id,
        full_name: input.full_name.trim(),
        city: input.city,
        address: input.address.trim(),
      })
      .eq('id', existing.id)
      .select('id')
      .single();
    if (updateError) {
      return { success: false, error: `Failed to link existing profile: ${updateError.message}` };
    }
    customerId = updated.id;
  } else {
    const { data: customer, error: customerError } = await admin
      .from('customers')
      .upsert(
        {
          full_name: input.full_name.trim(),
          phone_whatsapp: phone,
          email,
          auth_user_id: authData.user.id,
          city: input.city,
          address: input.address.trim(),
        },
        { onConflict: 'email' },
      )
      .select('id')
      .single();

    if (customerError) {
      return { success: false, error: `Failed to create profile: ${customerError.message}` };
    }
    customerId = customer.id;
  }

  // Create the default address in the address book.
  const { error: addrError } = await admin
    .from('customer_addresses')
    .insert({
      customer_id: customerId,
      full_name: input.full_name.trim(),
      phone_whatsapp: phone,
      city: input.city,
      address: input.address.trim(),
      is_default: true,
    });

  if (addrError) {
    return { success: false, error: `Failed to save default address: ${addrError.message}` };
  }

  return { success: true };
}

/**
 * Log in with email + password.
 */
export async function signInWithEmailPassword(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: input.email.trim().toLowerCase(),
    password: input.password,
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Log out the current user.
 */
export async function signOutAction(): Promise<AuthResult> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return { success: true };
}

/**
 * Add a new (non-default) address to the logged-in customer's address book.
 */
export async function addAddressAction(input: {
  full_name: string;
  phone_whatsapp: string;
  city: string;
  address: string;
  makeDefault?: boolean;
}): Promise<AuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not signed in.' };

  if (!input.full_name?.trim()) return { success: false, error: 'Name is required.' };
  if (!input.phone_whatsapp?.trim())
    return { success: false, error: 'WhatsApp number is required.' };
  if (!input.city) return { success: false, error: 'City is required.' };
  if (!input.address?.trim()) return { success: false, error: 'Address is required.' };

  const admin = createAdminClient();
  const { data: customer, error: custError } = await admin
    .from('customers')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle();
  if (custError || !customer)
    return { success: false, error: 'Profile not found. Please sign up again.' };

  if (input.makeDefault) {
    const { error: clearErr } = await admin
      .from('customer_addresses')
      .update({ is_default: false })
      .eq('customer_id', customer.id);
    if (clearErr)
      return { success: false, error: `Failed to update default address: ${clearErr.message}` };
  }

  const { error: insertErr } = await admin
    .from('customer_addresses')
    .insert({
      customer_id: customer.id,
      full_name: input.full_name.trim(),
      phone_whatsapp: input.phone_whatsapp.trim(),
      city: input.city,
      address: input.address.trim(),
      is_default: Boolean(input.makeDefault),
    });

  if (insertErr)
    return { success: false, error: `Failed to save address: ${insertErr.message}` };

  return { success: true };
}

/**
 * Set a specific saved address as the customer's default.
 */
export async function setDefaultAddressAction(addressId: string): Promise<AuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not signed in.' };

  const admin = createAdminClient();
  const { data: customer, error: custError } = await admin
    .from('customers')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle();
  if (custError || !customer)
    return { success: false, error: 'Profile not found.' };

  const { error: clearErr } = await admin
    .from('customer_addresses')
    .update({ is_default: false })
    .eq('customer_id', customer.id);
  if (clearErr) return { success: false, error: `Failed to clear default: ${clearErr.message}` };

  const { error: setErr } = await admin
    .from('customer_addresses')
    .update({ is_default: true })
    .eq('id', addressId)
    .eq('customer_id', customer.id);
  if (setErr) return { success: false, error: `Failed to set default: ${setErr.message}` };

  return { success: true };
}
