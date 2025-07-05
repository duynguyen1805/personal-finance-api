import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Body,
  Param
} from '@nestjs/common';
import { ApiTags, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { SingleUploadInterceptor, MultiUploadInterceptor } from '../../common/interceptors/upload.interceptor';

@ApiTags('upload-example')
@Controller('upload-example')
export class UploadExampleController {

  // Cách 1: Sử dụng custom interceptor cho single file
  @Post('single')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload'
        },
      },
      required: ['file']
    },
  })
  @UseInterceptors(SingleUploadInterceptor)
  async uploadSingleFile(@UploadedFile() file: Express.Multer.File) {
    return {
      message: 'File uploaded successfully',
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    };
  }

  // Cách 2: Sử dụng custom interceptor cho multiple files
  @Post('multiple')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Multiple files to upload (max 100 files)'
        },
      },
      required: ['files']
    },
  })
  @UseInterceptors(MultiUploadInterceptor)
  async uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
    const fileDetails = files.map(file => ({
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    }));

    return {
      message: `${files.length} files uploaded successfully`,
      files: fileDetails
    };
  }

  // Cách 3: Upload với thông tin bổ sung
  @Post('with-info')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        description: {
          type: 'string',
          description: 'File description'
        },
        category: {
          type: 'string',
          description: 'File category'
        }
      },
      required: ['file']
    },
  })
  @UseInterceptors(SingleUploadInterceptor)
  async uploadWithInfo(
    @UploadedFile() file: Express.Multer.File,
    @Body('description') description: string,
    @Body('category') category: string
  ) {
    return {
      message: 'File uploaded with additional info',
      file: {
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      },
      metadata: {
        description,
        category
      }
    };
  }

  // Cách 4: Upload với parameter
  @Post('category/:categoryId')
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        }
      },
      required: ['file']
    },
  })
  @UseInterceptors(SingleUploadInterceptor)
  async uploadToCategory(
    @UploadedFile() file: Express.Multer.File,
    @Param('categoryId') categoryId: string
  ) {
    return {
      message: 'File uploaded to specific category',
      categoryId,
      file: {
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      }
    };
  }
} 