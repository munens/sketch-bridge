import React from "react";
import { useNavigate } from "react-router-dom";
import { Panel, Layout } from "../../components";

const Start = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="col-span-4 sm:col-span-6 md:col-span-8 lg:col-span-10 xl:col-span-12 flex items-center justify-center min-h-screen">
        <Panel backgroundColor="bg-white" className="p-8 max-w-md">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-black-900 mb-2">
                SketchBridge
              </h1>
              <p className="text-black-600">
                Design-to-code collaboration platform
              </p>
            </div>
            
            <button
              onClick={() => navigate('/canvas')}
              className="w-full px-6 py-3 bg-token-primary text-white rounded-lg hover:bg-token-primary-dark transition-colors font-medium"
            >
              Open Canvas
            </button>

            <div className="pt-4 border-t border-black-300">
              <p className="text-sm text-black-600 mb-2">Features:</p>
              <ul className="text-sm text-black-600 space-y-1">
                <li>• Draw with rectangles, circles, and freehand paths</li>
                <li>• Infinite canvas with pan and zoom</li>
                <li>• Design token-based colors</li>
                <li>• Real-time property editing</li>
              </ul>
            </div>
          </div>
        </Panel>
      </div>
    </Layout>
  );
};

export default Start;
