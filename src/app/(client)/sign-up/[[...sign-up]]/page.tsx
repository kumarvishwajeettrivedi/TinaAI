"use client";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-purple-100">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-2xl">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to <span className="text-indigo-600">Tina</span>
            <span className="text-indigo-600">AI</span>
          </h2>
          <p className="mt-4 text-sm text-gray-600">
            Sign up is currently disabled. Please use the sign-in page with any email and password.
          </p>
          <a
            href="/sign-in"
            className="mt-6 inline-block px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Go to Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
