import React from 'react';
import { ToastProvider } from './ui/ToastProvider';
import { WorkOrderPage } from './components/WorkOrderPage';

/**
 * 工单页独立预览壳：430px 手机宽度居中，背景 #f9f9f7
 */
export default function App() {
  return (
    <div className="min-h-screen w-full bg-[#f9f9f7] flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-[#f9f9f7] relative overflow-x-hidden">
        <ToastProvider>
          <WorkOrderPage
            /* 独立包无路由，「返回」还原为主工程里的可见形态，点击仅提示 */
            onGoToMenu={() => window.dispatchEvent(new CustomEvent('standalone:back'))}
            userProfile={{ uid: 'tcb_u_88201948', nickname: '黑曜石先锋食客 #3F0EE6', phone: '' }}
          />
        </ToastProvider>
      </div>
    </div>
  );
}
