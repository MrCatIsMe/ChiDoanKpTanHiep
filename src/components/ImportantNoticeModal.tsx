import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function ImportantNoticeModal({ onClose }: Props) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-amber-200"
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2.5 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all duration-200 shadow-sm"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-4 mb-6 text-amber-600">
            <div className="p-3 bg-amber-100 rounded-full">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900">
              THÔNG BÁO QUAN TRỌNG
            </h2>
          </div>
          
          <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
            <p className="font-semibold">Kính gửi các bạn đoàn viên,</p>
            <p>
              Do phát sinh một số sự cố kỹ thuật ngoài mong muốn trong quá trình nâng cấp và điều chỉnh hệ thống, 
              dữ liệu tài khoản của các bạn đã bị mất.
            </p>
            <p>
              Để tiếp tục sử dụng hệ thống quản lý sinh hoạt hè, mong các bạn vui lòng 
              <span className="font-bold text-blue-600"> đăng ký lại tài khoản thành viên</span> theo hướng dẫn trên website.
            </p>
            <p>
              Ban quản trị và Admin xin gửi lời xin lỗi chân thành vì sự bất tiện này. 
              Chúng tôi đang rà soát và khắc phục để đảm bảo tình trạng tương tự không xảy ra trong thời gian tới.
            </p>
            <p>Rất mong nhận được sự thông cảm và hợp tác của các bạn.</p>
            <p className="font-semibold text-slate-900">Xin chân thành cảm ơn!</p>
          </div>

          <button
            onClick={onClose}
            className="mt-8 w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            Tôi đã hiểu và sẽ đăng ký lại
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
