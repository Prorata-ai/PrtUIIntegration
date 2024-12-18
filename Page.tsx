'use client';

 

import { useState } from 'react';

import { useSearchParams, useRouter } from 'next/navigation';

import Modal from '@/components/Modal';

 

export default function UpdateProfile() {

  const searchParams = useSearchParams();

  const router = useRouter();

  const [showTerms, setShowTerms] = useState(false);

  const [showPrivacy, setShowPrivacy] = useState(false);

  const [formData, setFormData] = useState({

    firstName: searchParams.get('firstName') || '',

    lastName: searchParams.get('lastName') || '',

    email: searchParams.get('email') || '',

    password: '',

    passwordConfirm: '',

    termsAccepted: false

  });

  const [error, setError] = useState('');

 

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

   

    if (formData.password !== formData.passwordConfirm) {

      setError('Passwords do not match');

      return;

    }

 

    if (!formData.termsAccepted) {

      setError('Please accept the terms and conditions');

      return;

    }

 

    try {

      const response = await fetch('/api/auth/update-profile', {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

        },

        body: JSON.stringify({

          password: formData.password,

          termsAccepted: formData.termsAccepted,

          sessionId: searchParams.get('session_state'),

          code: searchParams.get('code'),

        }),

      });

 

      if (!response.ok) {

        throw new Error('Failed to update profile');

      }

 

      // Get the redirect URL from the response

      const { redirectUrl } = await response.json();

      router.push(redirectUrl);

    } catch (err) {

      setError(err.message);

    }

  };

 

  return (

    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">

      <div className="sm:mx-auto sm:w-full sm:max-w-md">

        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">

          Create Password

        </h2>

      </div>

 

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

          {error && (

            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">

              {error}

            </div>

          )}

 

          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* Disabled Profile Fields */}

            <div>

              <label className="block text-sm font-medium text-gray-700">

                First name

              </label>

              <input

                type="text"

                value={formData.firstName}

                disabled

                className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-500"

              />

            </div>

 

            <div>

              <label className="block text-sm font-medium text-gray-700">

                Last name

              </label>

              <input

                type="text"

                value={formData.lastName}

                disabled

                className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-500"

              />

            </div>

 

            <div>

              <label className="block text-sm font-medium text-gray-700">

                Email

              </label>

              <input

                type="email"

                value={formData.email}

                disabled

                className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-500"

              />

            </div>

 

            {/* Password Fields */}

            <div>

              <label className="block text-sm font-medium text-gray-700">

                Create password (min. 8 chars)

              </label>

              <input

                type="password"

                value={formData.password}

                onChange={(e) => setFormData({ ...formData, password: e.target.value })}

                required

                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"

              />

            </div>

 

            <div>

              <label className="block text-sm font-medium text-gray-700">

                Confirm password

              </label>

              <input

                type="password"

                value={formData.passwordConfirm}

                onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}

                required

                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"

              />

            </div>

 

            {/* Terms Checkbox */}

            <div className="flex items-start">

              <input

                type="checkbox"

                checked={formData.termsAccepted}

                onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}

                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"

              />

              <label className="ml-2 block text-sm text-gray-900">

                I am 18 years of age or older and agree to the{' '}

                <button

                  type="button"

                  onClick={() => setShowTerms(true)}

                  className="text-indigo-600 hover:text-indigo-500"

                >

                  Terms

                </button>{' '}

                and{' '}

                <button

                  type="button"

                  onClick={() => setShowPrivacy(true)}

                  className="text-indigo-600 hover:text-indigo-500"

                >

                  Privacy Policy

                </button>

              </label>

            </div>

 

            <div>

              <button

                type="submit"

                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"

              >

                Create account

              </button>

            </div>

          </form>

 

          <div className="mt-6">

            <div className="text-sm">

              Need help?{' '}

              <a

                href=mailto:support@gist.ai

                className="font-medium text-indigo-600 hover:text-indigo-500"

              >

                Email Gist support

              </a>

            </div>

          </div>

        </div>

      </div>

 

      {/* Modals */}

      <Modal>

        isOpen={showTerms}

        onClose={() => setShowTerms(false)}

        title="Terms and Conditions"

      >

        {/* Add your terms content here */}

      </Modal>

 

      <Modal

        isOpen={showPrivacy}

        onClose={() => setShowPrivacy(false)}

        title="Privacy Policy"

      >

        {/* Add your privacy policy content here */}

      </Modal>

    </div>

  );

}