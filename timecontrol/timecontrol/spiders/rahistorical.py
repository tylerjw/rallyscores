# -*- coding: utf-8 -*-
import scrapy
import logging

logger = logging.getLogger(__name__)

class RahistoricalSpider(scrapy.Spider):
    name = 'rahistorical'
    allowed_domains = ['rally-america.com']
    current_url = 'http://www.rally-america.com/events#'
    archive_url = 'http://www.rally-america.com/events/archive'

    def start_requests(self):
        yield scrapy.Request(self.current_url, self.parse_events)
        yield scrapy.Request(self.archive_url, self.parse_archive)

    def parse_events(self, response):
        main_content = response.xpath('//div[@id="content-main"]')
        link_tags = list(set(main_content.xpath('.//h3/a[starts-with(@href,"/events/2")]')))
        link_tags += list(set(main_content.xpath('.//li/a[starts-with(@href,"/events/2")]')))

        for tag in link_tags:
            link = tag.xpath('.//@href').extract_first()
            _,_,year,event_code = link.split('/')
            name = tag.xpath('.//text()').extract_first()

            logger.debug('{}, {}, {}, {}, {}'.format(tag, link,year,event_code,name))
            yield {'year': year, 'evet_code': event_code, 'name': name}


    def parse_archive(self, response):
        main_content = response.xpath('//div[@id="content-main"]')
        links = list(set(main_content.xpath('.//li/a[starts-with(@href,"/events/2")]/@href').extract()))

        for link in links:
            yield scrapy.Request(response.urljoin(link), self.parse_events)