"use client"
import React from "react"
import { motion } from "framer-motion"

import { Image, Spacer, Button } from "@heroui/react"
import { useAuthenticationDisclosure } from "@/hooks/singleton"


const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" as const },
}

const Page = () => {

  return (
    <div>
      <Spacer y={20} />
      <Spacer y={20} />
      <motion.div
        className="grid grid-cols-1 md:grid-cols-5 gap-6"
        {...fadeInUp}
      >
        <div className="col-span-3">
          <div className="text-4xl font-bold flex gap-1">StarCi Academy</div>
          <Spacer y={6} />
          <div>
            {/* <QuotesIcon size={20} className="text-foreground-500" /> */}
            <Spacer y={2} />
            <div className="text-sm text-foreground-500 flex flex-col gap-1 italic text-justify">
              <div>Khóa học IT trên mạng tràn lan, nhưng nội dung cô đọng và đi vào tư duy thực chiến lại rất ít.</div>
              <div>StarCi Academy được thành lập ra để thay đổi điều đó.</div>
              <div>Chúng tớ tập trung xây dựng tư duy lập trình - từ Fullstack, DevOps, Security đến Solution Architect - với lộ trình rõ ràng và thực tế.</div>
            </div >
            <Spacer y={2} />
            <div className="text-sm text-secondary italic">Nguyen Van Tu Cuong, Founder & Core Instructor </div>
            <Spacer y={2} />
            <div className="flex items-center gap-2">
              {/* <Link href="https://www.facebook.com/starci183"><FacebookLogoIcon size={20} className="text-secondary" /></Link>
              <Link href="https://github.com/starci183"><GithubLogoIcon size={20} className="text-secondary" /></Link> */}
            </div>
          </div>
        </div>
        <iframe
          className="w-full h-full rounded-medium col-span-2"
          src="https://www.youtube.com/watch?v=KlkRLUpHDPc"
          title="YouTube video"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </motion.div>
      <Spacer y={48} />
      <motion.div
        className="flex items-center justify-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      >
        <div className="text-2xl font-bold flex gap-1">Điều gì làm cho StarCi Academy khác biệt?</div>
      </motion.div>
      <Spacer y={6} />
      <motion.div
        className="text-sm text-foreground-500 text-center max-w-[600px] mx-auto italic"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
      >
        StarCi Academy tập trung vào bản chất của ngành IT. Chúng tớ không chỉ dạy kiến thức mà còn đào tạo tư duy lập trình chuẩn mực và khả năng thiết kế hệ thống - những năng lực cốt lõi giúp bạn phát triển bền vững trong thời đại AI.
      </motion.div>
      <Spacer y={24} />
      <motion.div
        className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      >
        <Image removeWrapper src="/1.png" alt="1" className="col-span-2" />
        <div className="col-span-3">
          <div className="text-xl font-bold flex gap-1">Tư duy trước stack</div>
          <Spacer y={4} />
          <div className="text-sm text-foreground-500 text-justify">
            Công nghệ thay đổi liên tục và kiến thức thì ở khắp nơi. Chúng tớ tập trung dạy bản chất, keyword và tư duy
            để sau khóa bạn tự research, đọc docs và mở rộng theo bất kỳ stack nào.
          </div>
        </div>
      </motion.div>
      <Spacer y={24} />
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-5 gap-6 items-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
      >
        <Image
          removeWrapper
          src="/2.png"
          alt="2"
          className="col-span-1 sm:col-span-2 order-1 sm:order-2"
        />
        <div className="col-span-1 sm:col-span-3 order-2 sm:order-1">
          <div className="text-xl font-bold">
            Chi phí tối thiểu, tiêu chuẩn cao
          </div>
          <Spacer y={4} />
          <div className="text-sm text-foreground-500 text-justify">
            StarCi Academy vận hành theo mô hình tinh gọn, loại bỏ các chi phí không cần thiết để giữ học phí ở mức dễ tiếp cận.
            Mục tiêu của chúng tớ là tạo ra một môi trường học tập chất lượng cao mà bất kỳ ai nghiêm túc với nghề đều có thể tham gia.
          </div>
        </div>
      </motion.div>
      <Spacer y={24} />
      <motion.div
        className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
      >
        <Image removeWrapper src="/3.png" alt="1" className="col-span-2" />
        <div className="col-span-3">
          <div className="text-xl font-bold flex gap-1">From Code to Career</div>
          <Spacer y={4} />
          <div className="text-sm text-foreground-500 text-justify">
            Chúng tớ dạy để bạn xây dựng những project có giá trị thực sự và hỗ trợ lâu dài trong quá trình phát triển sự nghiệp.
          </div>
        </div>
      </motion.div>
      <Spacer y={48} />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
      >
        {/* <Courses /> */}
      </motion.div>
    </div>
  )
}

export default Page
