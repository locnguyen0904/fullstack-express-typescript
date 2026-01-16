# Story 4.2: PDF Rendering Worker

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Worker,
I want to render the resume HTML to PDF,
so that the user gets a high-quality file.

## Acceptance Criteria

1. **Given** a resume data object, **When** the worker runs, **Then** it should launch a headless browser to capture the PDF.
2. **And** if Free user, inject watermark into the PDF.
3. **And** if Paid user, generate clean PDF without watermark.
4. **And** the PDF should be ATS-friendly (selectable text, consistent headings).
5. **And** the PDF should be stored in file storage and URL returned.
6. **And** NFR-05: ≥99% of export jobs should succeed.

## Tasks / Subtasks

- [ ] **Task 1: Setup Puppeteer for PDF Generation** (AC: 1, 4)
  - [ ] Install `puppeteer` package
  - [ ] Create `backend/src/workers/pdf/pdf-renderer.ts`
  - [ ] Configure headless browser launch:

    ```typescript
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    ```

- [ ] **Task 2: Create Resume HTML Renderer** (AC: 1, 4)
  - [ ] Create `backend/src/workers/pdf/html-generator.ts`
  - [ ] Generate HTML from resume data using same templates as frontend
  - [ ] Include inline CSS for consistent styling
  - [ ] Ensure ATS-friendly structure:
    - Semantic HTML elements
    - Proper heading hierarchy
    - Selectable text (no images for text)

- [ ] **Task 3: Implement PDF Generation Function** (AC: 1, 4)
  - [ ] Create `generatePDF(resumeId, options)`:

    ```typescript
    async function generatePDF(resumeId: string, watermarked: boolean) {
      const resume = await resumeService.findById(resumeId);
      const html = generateHTML(resume);
      
      const browser = await puppeteer.launch({ ... });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
      });
      
      await browser.close();
      return pdfBuffer;
    }
    ```

- [ ] **Task 4: Implement Watermark Injection** (AC: 2, 3)
  - [ ] Create `backend/src/workers/pdf/watermark.ts`
  - [ ] Add watermark CSS/HTML for free users:

    ```css
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 60px;
      opacity: 0.1;
      color: #000;
      z-index: 9999;
      pointer-events: none;
    }
    ```

  - [ ] Inject watermark text: "Created with CVCraft.ai"

- [ ] **Task 5: Setup File Storage** (AC: 5)
  - [ ] Create `backend/src/services/storage.service.ts`
  - [ ] For MVP: Store in local `uploads/` directory
  - [ ] Future: Integrate with S3/GCS
  - [ ] Generate unique filename: `{userId}/{exportId}.pdf`
  - [ ] Return public URL

- [ ] **Task 6: Create Export Worker** (AC: all)
  - [ ] Create `backend/src/workers/export.worker.ts`
  - [ ] Implement BullMQ processor:

    ```typescript
    const exportWorker = new Worker('export-queue', async (job) => {
      const { exportId, resumeId, watermarked } = job.data;
      
      try {
        // Update status to processing
        await exportService.updateStatus(exportId, 'processing');
        
        // Generate PDF
        const pdfBuffer = await generatePDF(resumeId, watermarked);
        
        // Store file
        const fileUrl = await storageService.upload(pdfBuffer, `${exportId}.pdf`);
        
        // Update status to completed
        await exportService.updateStatus(exportId, 'completed', { fileUrl });
        
      } catch (error) {
        await exportService.updateStatus(exportId, 'failed', { error: error.message });
        throw error; // Trigger retry
      }
    }, { connection: redisConnection });
    ```

- [ ] **Task 7: Add Worker to Docker Compose** (AC: all)
  - [ ] Update `docker-compose.yml`:

    ```yaml
    worker:
      build: ./backend
      command: npm run worker
      depends_on:
        - redis
        - mongo
      environment:
        - REDIS_HOST=redis
    ```

  - [ ] Add `worker` script to `package.json`

- [ ] **Task 8: Implement Error Handling & Retries** (AC: 6)
  - [ ] Configure BullMQ retry options
  - [ ] Log errors for monitoring
  - [ ] Implement graceful shutdown

## Dev Notes

### Architecture Compliance

- **Worker Rules (from project-context.md):**
  - Workers MUST be idempotent (handle duplicate jobs safely)
  - Workers MUST NOT crash the process on error (catch all exceptions)
  - Use `QueueService` (BullMQ wrapper)

### PDF Generation Flow

```text
BullMQ Job: { exportId, resumeId, watermarked }
    │
    ├── Update Export status = 'processing'
    │
    ├── Fetch Resume Data
    │
    ├── Generate HTML from Template
    │   └── Include inline CSS
    │
    ├── If watermarked: Inject watermark HTML
    │
    ├── Launch Puppeteer
    │   └── Render page → PDF buffer
    │
    ├── Upload to Storage
    │   └── Get file URL
    │
    ├── Update Export status = 'completed'
    │   └── Store fileUrl
    │
    └── Close browser
```

### File Structure

```text
backend/src/
├── workers/
│   ├── index.ts              # NEW: Worker entry point
│   ├── export.worker.ts      # NEW: Export job processor
│   └── pdf/
│       ├── pdf-renderer.ts   # NEW: Puppeteer wrapper
│       ├── html-generator.ts # NEW: HTML from resume data
│       └── watermark.ts      # NEW: Watermark logic
├── services/
│   └── storage.service.ts    # NEW: File storage
```

### ATS-Friendly PDF Guidelines

- Use semantic HTML (`<section>`, `<article>`, `<h1>`-`<h6>`)
- No text as images
- Consistent heading hierarchy
- Standard fonts (Arial, Helvetica, Times)
- Avoid tables for layout
- Ensure text is selectable

### Testing Requirements

- [ ] Verify PDF generation completes
- [ ] Verify watermark appears for free users
- [ ] Verify no watermark for paid users
- [ ] Verify PDF text is selectable
- [ ] Verify failed jobs retry correctly
- [ ] Verify worker doesn't crash on error

### Previous Story Context

**Dependencies:**

- Story 4.1 (Export Queue) - Export model and service
- Story 2.4 (Templates) - Template rendering (share or duplicate logic)

### References

- [PRD - FR-25, NFR-03, NFR-05](../planning-artifacts/prd.md) - Watermarking, latency, success rate
- [Story 4.1](./4-1-async-export-queue-setup.md) - Export queue setup
- [Puppeteer Docs](https://pptr.dev/)

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
