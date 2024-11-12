"use client"; // 标记为客户端组件

import { useEffect,useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useRouter } from 'next/navigation';

// import { Autoplay, Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';


import { Autoplay, Pagination } from 'swiper/modules';
import {
    getSlideshow
  } from '../../lib/ton_supabase_api'

const Carousel = () => {

    const router = useRouter();

    const [banners,set_banners] = useState([]);


    const fetch_banner = async () => {
        console.log('fetch_banner')
        let data = await getSlideshow()
        set_banners(data)
      }


      const to_detail = async (app_id) => {
        console.log('to_detail in = ', app_id)
        router.push(`/appsDetail/${app_id}`);
      }

      useEffect(() => {
        console.log('Carousel useEffect in')
        fetch_banner()
        console.log('Carousel useEffect out')
      }, [])

    return (
        <Swiper
            className='image-wrapper_1 cursor-pointer'
            // spaceBetween={30}
            autoplay={{
                delay: 3000,
                disableOnInteraction: false,
            }}
            pagination={{
                clickable: true,
            }}
            modules={[Autoplay, Pagination]}
            loop={true}
        >
            {
                banners && banners.length ? <div>
                    {
                        banners.map(banner => {
                            return (
                                <SwiperSlide key={banner.id} onClick={() => to_detail(banner.app_id)}>
                                    <img className='image_2' src={banner.image_link} alt="Image 1" />
                                </SwiperSlide>
                            )
                        })
                    }
                </div> : 
                <SwiperSlide>
                   <img className='image_2' src="/images/Banner.png" alt="Image 1" />
               </SwiperSlide>
            }
            
        </Swiper>
    );
};

export default Carousel;