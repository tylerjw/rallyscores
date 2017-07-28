# -*- coding: utf-8 -*-
import scrapy
import logging
import datetime
from daterangeparser import parse

logger = logging.getLogger(__name__)

class RaEventsSpider(scrapy.Spider):
    name = 'ra_events'
    allowed_domains = ['rally-america.com']
    events_url = 'http://www.rally-america.com/events/'

    custom_settings = {
        'MONGO_DATABASE': 'rally',
        'MONGO_COLLECTION': 'ra_events',
        'ID_FIELDS': {'year','event_code'},
    }

    def start_requests(self):
        # for testing....
        # yield scrapy.Request('http://www.rally-america.com/events/2017/SNODRIFT', self.parse_event)
        # return

        first_year = 2005 # first year of scores on ra site
        this_year = int(datetime.datetime.now().year)
        for year in range(first_year, this_year+1):
            url = self.events_url + str(year)
            yield scrapy.Request(url, self.parse_events)

    def parse_events(self, response):
        main_content = response.xpath('//div[@id="content-main"]')
        national_links = main_content.xpath('.//h3/a[starts-with(@href,"/events/2")]/@href').extract()

        for link in national_links:
            yield scrapy.Request(response.urljoin(link), callback=self.parse_event)

    def parse_event(self, response):
        # for testing....
        # scrapy.shell.inspect_response(response, self)

        _,_,_,_,year,event_code = response.url.split('/')

        item = {'year': year, 'event_code': event_code}

        # get parent if it exists
        parent = response.xpath("//strong[contains(text(),'Parent')]/following-sibling::a").extract_first()
        if parent: 
            item['parent'] = parent
            item['type'] = 'child'

        associated_event_links = response.xpath("//strong[contains(text(),'Associated')]/following-sibling::a/@href").extract()
        associated_events = []
        if associated_event_links:
            for link in associated_event_links:
                _,_,year,event_code = link.split('/')
                associated_events.append({'year': year, 'event_code': event_code})
                yield scrapy.Request(response.urljoin(link), callback=self.parse_event)

            item['children'] = associated_events
            item['type'] = 'parent'

        if 'type' not in item:
            item['type'] = 'parent'

        item['name'] = response.xpath('//h2[@class="content-title"]/text()[2]').extract_first().strip()
        dates = response.xpath('//div[@class="event-details"]/h3[1]/text()').extract_first().strip()
        start, end = parse(dates)
        end = (end if end else start)
        item['start'] = start
        item['end'] = end
        item['town'] = response.xpath('//div[@class="event-details"]/h3[2]/text()').extract_first().strip()
        item['event_type'] = response.xpath('//div[@class="event-details"]/h5[1]/text()').extract_first().strip()

        yield item



