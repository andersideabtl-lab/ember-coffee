"use client";

import { MapPin, Clock, Phone } from "lucide-react";

export default function Location() {
  return (
    <section id="location" className="py-20 bg-amber-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-amber-900 mb-4">
          위치 및 영업시간
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          언제든지 편하게 방문해주세요
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* 위치 정보 */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex items-start mb-6">
              <MapPin className="text-amber-700 mr-4 mt-1" size={24} />
              <div>
                <h3 className="text-2xl font-bold text-amber-900 mb-2">주소</h3>
                <p className="text-gray-700">
                  서울특별시 강남구 테헤란로 123<br />
                  엠버빌딩 1층
                </p>
              </div>
            </div>

            <div className="flex items-start mb-6">
              <Phone className="text-amber-700 mr-4 mt-1" size={24} />
              <div>
                <h3 className="text-2xl font-bold text-amber-900 mb-2">연락처</h3>
                <p className="text-gray-700">02-1234-5678</p>
              </div>
            </div>

            <div className="flex items-start">
              <Clock className="text-amber-700 mr-4 mt-1" size={24} />
              <div>
                <h3 className="text-2xl font-bold text-amber-900 mb-2">영업시간</h3>
                <div className="text-gray-700 space-y-1">
                  <p>월요일 - 금요일: 07:00 - 22:00</p>
                  <p>토요일 - 일요일: 08:00 - 23:00</p>
                </div>
              </div>
            </div>
          </div>

          {/* 지도 영역 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3165.0235175518375!2d127.02761041531038!3d37.49794227980707!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357ca1588f02c4b5%3A0x9b9e8e5b3e8b3e8b!2z7ISc7Jq47Yq567OE7IucIOqwleuCqOq1rCDthYzqs6XroZwg7Yq567OE7Iuc66GcIDI3Mw!5e0!3m2!1sko!2skr!4v1699999999999!5m2!1sko!2skr"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full min-h-[400px]"
              title="Ember Coffee 위치 지도"
              aria-label="Ember Coffee 위치 지도: 서울특별시 강남구 테헤란로 123 엠버빌딩 1층"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
