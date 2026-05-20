import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/core/ui/Icon";
import { Badge } from "@/core/ui/Badge";
import { getPostAction } from "@/app/admin/posts/actions/posts";
import { PostContent } from "./components/PostContent";
import { auth } from "@/auth";

/**
 * Helper to extract clean text from BlockNote JSON string/array for SEO description
 */
function extractTextFromBlockNote(contentJson: string | any): string {
  try {
    if (!contentJson) return "";
    const blocks = typeof contentJson === "string" ? JSON.parse(contentJson) : contentJson;
    if (!Array.isArray(blocks)) return "";
    
    let text = "";
    for (const block of blocks) {
      if (block.content) {
        if (Array.isArray(block.content)) {
          text += block.content.map((c: any) => c.text || "").join("") + " ";
        } else if (typeof block.content === "string") {
          text += block.content + " ";
        }
      }
      if (text.length > 250) break;
    }
    return text.trim();
  } catch (e) {
    return "";
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate premium SEO Metadata for the post details page
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const post = await getPostAction(slug);
    
    const session = await auth();
    const isAdmin = (session as any)?.user?.role === "admin";
    const isPublished = post?.status === "published";

    if (!post || (!isPublished && !isAdmin)) {
      return {
        title: "Bài viết không tìm thấy | Học Từ Thiện",
        description: "Không thể tìm thấy bài viết hoặc bài viết đã bị gỡ bỏ.",
      };
    }

    const title = `${post.title} | Học Từ Thiện`;
    
    // Dynamic description generation from post summary or content body
    let description = post.summary || post.metadata?.summary;
    if (!description && post.content) {
      description = extractTextFromBlockNote(post.content);
    }
    if (!description) {
      description = "Đọc bài viết ý nghĩa và hoạt động giáo dục từ Học Từ Thiện.";
    }
    if (description.length > 160) {
      description = description.substring(0, 157) + "...";
    }

    // Process cover / thumbnail URL to ensure it is properly encoded (no space characters)
    let imageUrl = post.metadata?.image || post.metadata?.thumbnail || post.coverImage?.url;
    const appUrl = process.env.AUTH_URL || "https://beta-app.hoctuthien.com";
    
    if (imageUrl) {
      if (imageUrl.startsWith("/")) {
        imageUrl = `${appUrl}${imageUrl}`;
      }
      // Properly encode special characters (especially spaces) to avoid breaking crawler/bot parses
      imageUrl = encodeURI(imageUrl);
    } else {
      imageUrl = `${appUrl}/images/og-default.png`;
    }

    const authorName = post.author?.fullName || "Học Từ Thiện";
    
    return {
      title,
      description,
      metadataBase: new URL(appUrl),
      alternates: {
        canonical: `/posts/${post.slug}`,
      },
      other: {
        image: imageUrl,
        summary: description,
      },
      openGraph: {
        title,
        description,
        url: `/posts/${post.slug}`,
        siteName: "Học Từ Thiện",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
        locale: "vi_VN",
        type: "article",
        publishedTime: post.publishedAt || post.createdAt,
        authors: [authorName],
        tags: post.postTags?.map((pt: any) => pt.tag?.name).filter(Boolean) || [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
    };
  } catch (error) {
    console.error("Failed to generate metadata for post:", error);
    return {
      title: "Bài viết | Học Từ Thiện",
      description: "Đọc các câu chuyện và kiến thức từ nền tảng Học Từ Thiện.",
    };
  }
}

export default async function PostDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let post: any = null;

  try {
    post = await getPostAction(slug);
  } catch (error) {
    console.error("Error fetching post in detail page:", error);
    notFound();
  }

  const session = await auth();
  const isAdmin = (session as any)?.user?.role === "admin";
  const isPublished = post?.status === "published";

  // Security: only allow viewing of published posts for public visitors, but allow Admin to preview draft posts
  if (!post || (!isPublished && !isAdmin)) {
    notFound();
  }

  const imageUrl = post.metadata?.thumbnail || post.coverImage?.url;
  const categoryName = post.category?.name || "Chưa phân loại";
  const authorName = post.author?.fullName || "Administrator";
  const formattedDate = new Date(post.publishedAt || post.createdAt).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-slate-50/50 min-h-screen pb-24">
      {!isPublished && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-black text-center py-3 px-4 shadow-md relative z-20 flex items-center justify-center gap-2 uppercase tracking-widest">
          <Icon name="AlertTriangle" size={14} />
          <span>Bạn đang xem bài viết ở chế độ BẢN THẢO (PREVIEW). Bài viết này chưa xuất bản.</span>
        </div>
      )}
      {/* Dynamic cover glassmorphism background */}
      {imageUrl && (
        <div className="absolute top-[80px] left-0 right-0 h-[480px] overflow-hidden pointer-events-none select-none z-0">
          <div 
            className="w-full h-full bg-cover bg-center scale-110 blur-[80px] opacity-[0.06] transition-opacity duration-1000"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/30 to-slate-50" />
        </div>
      )}

      {/* Main Content Area */}
      <div className="container-custom relative z-10 pt-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2.5 text-xs text-slate-400 font-bold mb-8 uppercase tracking-wider">
          <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <Icon name="Home" size={13} />
            <span>Trang chủ</span>
          </Link>
          <Icon name="ChevronRight" size={12} className="text-slate-300" />
          <span className="text-slate-400">Bài viết</span>
          <Icon name="ChevronRight" size={12} className="text-slate-300" />
          <span className="text-slate-800 line-clamp-1 max-w-[200px] md:max-w-xs">{post.title}</span>
        </nav>

        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-black text-slate-500 hover:text-primary transition-all mb-8 group uppercase tracking-widest"
        >
          <Icon name="ArrowLeft" size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Quay lại trang chủ</span>
        </Link>

        {/* Dynamic Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Main Post Content Card */}
          <div className="lg:col-span-8 space-y-8">
            <article className="bg-white border border-slate-100 shadow-sm rounded-3xl overflow-hidden p-6 md:p-10">
              
              {/* Category, Date & Read time metadata */}
              <div className="flex flex-wrap items-center gap-4 text-xs mb-6">
                <Badge variant="primary" className="!rounded-full !px-3.5 !py-1.5 shadow-sm text-[10px] font-black uppercase tracking-wider">
                  {categoryName}
                </Badge>
                <div className="flex items-center gap-2 text-slate-400 font-semibold">
                  <span>{formattedDate}</span>
                  <span>•</span>
                  <span>10 phút đọc</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-8">
                {post.title}
              </h1>

              {/* Featured Cover Image */}
              {imageUrl && (
                <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden border border-slate-100 shadow-md mb-10">
                  <img 
                    src={imageUrl} 
                    alt={post.title} 
                    className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-700" 
                  />
                </div>
              )}

              {/* BlockNote Document Renderer wrapper */}
              <div className="prose prose-slate max-w-none pt-4 border-t border-slate-100">
                <PostContent content={post.content} />
              </div>

              {/* Tags Section */}
              {post.postTags && post.postTags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-slate-100">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Thẻ từ khóa:</h4>
                  <div className="flex flex-wrap gap-2">
                    {post.postTags.map((pt: any) => (
                      <span 
                        key={pt.tag.id} 
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600 rounded-xl text-xs font-bold"
                      >
                        #{pt.tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>
          </div>

          {/* Right Column: Premium Sidebar Widget Section */}
          <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
            
            {/* Author details card */}
            <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-8 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-2 bg-primary" />
              <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-2xl mx-auto mb-4 shadow-inner border border-primary/20">
                {authorName.substring(0, 2).toUpperCase()}
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-1">{authorName}</h3>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-6">Tác giả bài viết</p>
              <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6">
                Chuyên viên quản lý nội dung học thuật và tin tức tại nền tảng Học Từ Thiện. Kết nối tri thức, chia sẻ yêu thương.
              </p>
              <div className="flex justify-center gap-3">
                {["Facebook", "Twitter", "Linkedin"].map((social) => (
                  <button 
                    key={social} 
                    className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center"
                    aria-label={`Share on ${social}`}
                  >
                    <Icon name={social as any} size={16} />
                  </button>
                ))}
              </div>
            </div>

            {/* Sharing / Call to Actions */}
            <div className="bg-gradient-to-br from-primary to-primary-variant text-white rounded-3xl p-8 shadow-lg shadow-primary/25 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-xl" />
              
              <h3 className="text-xl font-black mb-3">Lan tỏa yêu thương cùng Học Từ Thiện</h3>
              <p className="text-white/80 text-xs font-medium leading-relaxed mb-6">
                Chia sẻ bài viết này đến bạn bè và người thân để cùng lan tỏa tinh thần học tập vì cộng đồng, góp sức dựng xây ngày mai tươi sáng.
              </p>
              <Link href="/">
                <button className="w-full bg-white hover:bg-slate-50 text-primary font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all active:scale-95 text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                  <Icon name="ArrowRight" size={16} />
                  <span>Xem thêm bài viết khác</span>
                </button>
              </Link>
            </div>

          </aside>

        </div>

      </div>
    </div>
  );
}
