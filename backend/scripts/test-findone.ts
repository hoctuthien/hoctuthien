import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PostService } from '../src/modules/post/services/post.service';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const postService = app.get(PostService);
  
  try {
    const slug = 'chuong-2-he-quan-tri-csdl-truy-van-du-lieu-bang';
    console.log(`Calling postService.findOne('${slug}')...`);
    const post = await postService.findOne(slug);
    console.log('Successfully found post:', JSON.stringify(post, null, 2));
  } catch (error) {
    console.error('Failed to find post. Error:', error);
  } finally {
    await app.close();
  }
}

run().catch(console.error);
