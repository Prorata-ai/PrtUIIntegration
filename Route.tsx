import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password, termsAccepted, sessionId, code } = await request.json();

    // First, update the password
    const passwordResponse = await fetch(`${process.env.KEYCLOAK_URL}/auth/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.KEYCLOAK_CLIENT_ID!,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
        code: code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/auth/update-profile`,
      }),
    });

    if (!passwordResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const { access_token, id_token } = await passwordResponse.json();

    // Get user info to get the user ID
    const userInfoResponse = await fetch(`${process.env.KEYCLOAK_URL}/auth/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/userinfo`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userInfo = await userInfoResponse.json();

    // Update password
    const updatePasswordResponse = await fetch(`${process.env.KEYCLOAK_URL}/auth/admin/realms/${process.env.KEYCLOAK_REALM}/users/${userInfo.sub}/reset-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        type: 'password',
        value: password,
        temporary: false,
      }),
    });

    if (!updatePasswordResponse.ok) {
      throw new Error('Failed to update password');
    }

    // Update user attributes for terms acceptance
    const updateAttributesResponse = await fetch(`${process.env.KEYCLOAK_URL}/auth/admin/realms/${process.env.KEYCLOAK_REALM}/users/${userInfo.sub}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        attributes: {
          terms_accepted: 'true',
          terms_accepted_date: new Date().toISOString(),
        },
      }),
    });

    if (!updateAttributesResponse.ok) {
      throw new Error('Failed to update user attributes');
    }

    // Return success with redirect URL
    return NextResponse.json({
      redirectUrl: `${process.env.APP_URL}/dashboard`,
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
