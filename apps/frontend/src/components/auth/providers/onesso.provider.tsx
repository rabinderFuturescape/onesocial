import { useCallback } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import interClass from '@gitroom/react/helpers/inter.font';

export const OnessoProvider = () => {
  const fetch = useFetch();
  const gotoLogin = useCallback(async () => {
    const link = await (await fetch('/auth/oauth/ONESSO')).text();
    window.location.href = link;
  }, []);

  return (
    <div
      onClick={gotoLogin}
      className={`cursor-pointer bg-blue-600 h-[44px] rounded-[4px] flex justify-center items-center text-white ${interClass} gap-[4px]`}
    >
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="21"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>
      <div>Sign in with Onesso</div>
    </div>
  );
};
