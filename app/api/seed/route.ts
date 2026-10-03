import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

async function getClient() {
  // Use admin client if SUPABASE_SERVICE_ROLE_KEY is provided, otherwise standard server client
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createAdminClient()
  }
  return await createClient()
}

async function handleSeed() {
  // Prevent execution in production unless explicitly enabled via seed secret
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_PRODUCTION_SEED) {
    return NextResponse.json(
      {
        success: false,
        error: 'Seeding route is disabled in production mode.',
      },
      { status: 403 }
    )
  }

  try {
    const supabase = await getClient()

    // 1. Verify Supabase connection by checking environment variables and querying
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'Supabase environment variables are not configured in .env.local',
          details: {
            NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          },
        },
        { status: 500 }
      )
    }

    // 2. Prepare Category Seed Data
    const categoriesToInsert = [
      {
        name: 'IT Engineer',
        slug: slugify('IT Engineer'),
        type: 'job_category',
      },
      {
        name: 'Overseas Jobs',
        slug: slugify('Overseas Jobs'),
        type: 'job_category',
      },
      {
        name: 'Japan',
        slug: slugify('Japan'),
        type: 'location',
      },
      {
        name: 'Korea',
        slug: slugify('Korea'),
        type: 'location',
      },
    ]

    // Insert categories (upsert on slug if applicable or standard insert)
    const { data: insertedCategories, error: categoryError } = await supabase
      .from('categories')
      .insert(categoriesToInsert)
      .select()

    if (categoryError) {
      return NextResponse.json(
        {
          success: false,
          step: 'insert_categories',
          message: 'Failed to insert categories',
          error: categoryError,
        },
        { status: 500 }
      )
    }

    // Select category IDs for linking jobs
    const itCategory = insertedCategories?.find((c) => c.slug === 'it-engineer')
    const overseasCategory = insertedCategories?.find((c) => c.slug === 'overseas-jobs')

    // 3. Prepare Sample Job Posts
    const jobsToInsert = [
      {
        title: 'Senior Fullstack Engineer (React / Node.js / Go) - Tokyo',
        slug: slugify('Senior Fullstack Engineer React Nodejs Go Tokyo'),
        thumbnail_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
        salary: '35 - 50 Man/tháng (~60 - 85 triệu VNĐ)',
        location: 'Tokyo, Nhật Bản',
        working_hours: '09:00 - 18:00 (Thứ 2 - Thứ 6, Hybrid 2 ngày/tuần)',
        requirements: 'Tối thiểu 3 năm kinh nghiệm với React & Node.js/Go. Tiếng Nhật N3 trở lên hoặc Tiếng Anh giao tiếp tốt.',
        benefits: 'Hỗ trợ visa kỹ sư dài hạn, trợ cấp nhà ở 50%, bảo hiểm chuẩn Nhật Bản, vé máy bay 1 chiều sang Nhật.',
        content: `
          <h3>Mô tả công việc</h3>
          <p>Tham gia phát triển hệ thống nền tảng cho khách hàng doanh nghiệp tại Tokyo. Thiết kế kiến trúc microservices và tối ưu hóa hiệu năng ứng dụng quy mô lớn.</p>
          <h3>Yêu cầu ứng viên</h3>
          <ul>
            <li>Thành thạo TypeScript, React, Next.js, Node.js hoặc Golang.</li>
            <li>Có kinh nghiệm làm việc với cơ sở dữ liệu PostgreSQL/MySQL và hạ tầng AWS/GCP.</li>
            <li>Tinh thần trách nhiệm cao, khả năng làm việc nhóm linh hoạt.</li>
          </ul>
        `,
        contact_info: 'Email: tuyendung@globalcareergate.com | Hotline: 0987.654.321',
        status: 'published',
        is_featured: true,
        category_id: itCategory?.id || null,
        views_count: 145,
      },
      {
        title: 'Kỹ Sư Cầu Nối BrSE (Bridge Software Engineer) - Osaka',
        slug: slugify('Ky Su Cau Noi BrSE Osaka'),
        thumbnail_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
        salary: '30 - 45 Man/tháng (~50 - 75 triệu VNĐ)',
        location: 'Osaka, Nhật Bản',
        working_hours: '08:30 - 17:30 (Thứ 2 - Thứ 6)',
        requirements: 'Tiếng Nhật tương đương N2 trở lên. Kinh nghiệm làm việc với đối tác Nhật Bản và quản lý team phát triển phần mềm.',
        benefits: 'Thưởng 2 lần/năm (tháng 6 và tháng 12), phụ cấp tiếng Nhật, chế độ nghỉ phép theo luật lao động Nhật Bản.',
        content: `
          <h3>Mô tả công việc</h3>
          <p>Đóng vai trò cầu nối kỹ thuật giữa khách hàng doanh nghiệp Nhật Bản và đội ngũ phát triển tại Việt Nam. Phân tích tài liệu yêu cầu (spec), Q&A và quản lý tiến độ dự án.</p>
          <h3>Yêu cầu ứng viên</h3>
          <ul>
            <li>Tiếng Nhật N2 trở lên, giao tiếp lưu loát và đọc hiểu tài liệu kỹ thuật tốt.</li>
            <li>Kinh nghiệm lập trình web/mobile tối thiểu 2 năm trước khi làm BrSE.</li>
          </ul>
        `,
        contact_info: 'Email: brse@globalcareergate.com | Hotline: 0987.654.321',
        status: 'published',
        is_featured: true,
        category_id: itCategory?.id || null,
        views_count: 98,
      },
      {
        title: 'Kỹ Sư Cơ Khí Thiết Kế CAD/CAM - Aichi',
        slug: slugify('Ky Su Co Khi Thiet Ke CAD CAM Aichi'),
        thumbnail_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
        salary: '25 - 35 Man/tháng (~42 - 60 triệu VNĐ)',
        location: 'Aichi, Nhật Bản',
        working_hours: '08:00 - 17:00 (Thứ 2 - Thứ 6, có tăng ca hưởng 125% lương)',
        requirements: 'Tốt nghiệp Đại học/Cao đẳng chuyên ngành Cơ khí, Chế tạo máy. Tiếng Nhật N4 trở lên.',
        benefits: 'Ký túc xá công ty đầy đủ tiện nghi, hỗ trợ ăn trưa, đào tạo tiếng Nhật nâng cao tại Nhật.',
        content: `
          <h3>Mô tả công việc</h3>
          <p>Thiết kế chi tiết máy, khuôn mẫu linh kiện ô tô sử dụng phần mềm AutoCAD, SolidWorks, CATIA. Phối hợp với xưởng sản xuất để theo dõi quá trình gia công mẫu.</p>
          <h3>Yêu cầu ứng viên</h3>
          <ul>
            <li>Đọc hiểu bản vẽ kỹ thuật cơ khí thành thạo.</li>
            <li>Có sức khỏe tốt, mong muốn làm việc lâu dài tại Nhật Bản.</li>
          </ul>
        `,
        contact_info: 'Email: cokhi@globalcareergate.com | Hotline: 0987.654.321',
        status: 'published',
        is_featured: false,
        category_id: overseasCategory?.id || null,
        views_count: 52,
      },
    ]

    const { data: insertedJobs, error: jobsError } = await supabase
      .from('jobs')
      .insert(jobsToInsert)
      .select()

    if (jobsError) {
      return NextResponse.json(
        {
          success: false,
          step: 'insert_jobs',
          message: 'Failed to insert sample jobs',
          error: jobsError,
          partialData: {
            categories: insertedCategories,
          },
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully verified Supabase connection and seeded sample data.',
        data: {
          categoriesCount: insertedCategories?.length || 0,
          jobsCount: insertedJobs?.length || 0,
          categories: insertedCategories,
          jobs: insertedJobs,
        },
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Unknown server error during database seed'
    return NextResponse.json(
      {
        success: false,
        error: errMessage,
      },
      { status: 500 }
    )
  }
}

// Support both GET (for easy browser testing) and POST
export async function GET() {
  return handleSeed()
}

export async function POST() {
  return handleSeed()
}
